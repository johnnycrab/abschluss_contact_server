/// <reference path="./ts-definitions/node/node.d.ts" />
/// <reference path="./ts-definitions/node_redis/node_redis.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var events = require('events');
var redis = require('redis');

/**
*
* JSON structure
*
* {
*   'id': hexstring,
*   'addresses': [
*     {
*       'ip': ipaddress
*       'port': port
*     },
*     {...}
*   ]
* }
*
*/
var NodeStorage = (function (_super) {
    __extends(NodeStorage, _super);
    function NodeStorage(keyExpiryInSeconds) {
        var _this = this;
        _super.call(this);
        this._redisClient = null;
        this._keyExpiryInSeconds = 3600 * 1000;
        this._isReadWritable = false;
        this._idListKey = 'idlist';
        this._idListLength = null;

        this._keyExpiryInSeconds = keyExpiryInSeconds;
        this._redisClient = redis.createClient();

        this._redisClient.on('error', function (err) {
            console.log('Redis error: ' + err);
        });

        this._redisClient.on('ready', function () {
            _this._isReadWritable = true;
            _this.emit('ready');
        });

        this._redisClient.on('end', function () {
            _this._isReadWritable = false;
        });
    }
    NodeStorage.prototype.getIdListLength = function () {
        return this._idListLength;
    };

    NodeStorage.prototype.setNodeInformation = function (jsonObject) {
        var _this = this;
        if (this._isReadWritable) {
            var id = jsonObject.id;
            var addresses = jsonObject.addresses;

            if (id.length === 40 && (addresses instanceof Array === true) && addresses.length) {
                var stringToWrite = JSON.stringify(jsonObject);

                // check if an entry with the id already exists
                this._redisClient.get(id, function (err, res) {
                    if (!err) {
                        // does not exist. add it to the list
                        if (!res) {
                            _this._redisClient.lpush(_this._idListKey, id, function (err, res) {
                                if (!err) {
                                    _this._idListLength = res;
                                }
                            });
                        }

                        _this._redisClient.set(id, stringToWrite, redis.print);
                        _this._redisClient.expire(id, _this._keyExpiryInSeconds, redis.print);
                    }
                });
            }
        }
    };

    NodeStorage.prototype.getRandomNode = function (callback) {
        var _this = this;
        if (!this._idListLength) {
            callback(null);
            return;
        }

        var randomIndex = Math.floor(Math.random() * this._idListLength);

        this._redisClient.lindex(this._idListKey, randomIndex, function (err, id) {
            if (err) {
                callback(null);
                return;
            }

            _this._redisClient.get(id, function (err, nodeData) {
                if (err) {
                    callback(null);
                    return;
                }

                if (!nodeData) {
                    // remove from the list
                    _this._redisClient.lrem(_this._idListKey, 0, id, function (err, numOfRemovedElements) {
                        if (numOfRemovedElements) {
                            _this._idListLength -= numOfRemovedElements;
                        }
                        _this.getRandomNode(callback);
                    });
                } else {
                    callback(nodeData);
                }
            });
        });
    };
    return NodeStorage;
})(events.EventEmitter);

module.exports = NodeStorage;
//# sourceMappingURL=NodeStorage.js.map
