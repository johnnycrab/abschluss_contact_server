/// <reference path='./test.d.ts' />
require('should');

var NodeStorage = require('../NodeStorage');
var redis = require('redis');

describe('TEST', function () {
    var redisClient = null;
    var nodeStorage = null;

    var id = "0a0000000000000078f406020100000005000000";

    var dummyNode = {
        "id": id,
        "addresses": [{ "ip": "127.0.0.1", "port": 55555 }]
    };

    before(function (done) {
        redisClient = redis.createClient();
        redisClient.on('ready', function () {
            redisClient.flushall();
            done();
        });
    });

    after(function (done) {
        if (redisClient) {
            redisClient.quit();
            redisClient.on('end', done);
        }
    });

    it('should successfully store a node', function (done) {
        nodeStorage = new NodeStorage(1);

        nodeStorage.on('ready', function () {
            nodeStorage.setNodeInformation(dummyNode);

            setTimeout(function () {
                redisClient.llen('idlist', function (err, res) {
                    if (res === 1 && 1 === nodeStorage.getIdListLength()) {
                        redisClient.get(id, function (err, res) {
                            if (res === JSON.stringify(dummyNode))
                                done();
                        });
                    }
                });
            }, 10);
        });
    });

    it('should expire the node id key', function (done) {
        setTimeout(function () {
            redisClient.get(id, function (err, res) {
                if (res === null)
                    done();
            });
        }, 1000);
    });

    it('should callback with null and the id list length should be zero', function (done) {
        nodeStorage.getRandomNode(function (data) {
            if (data === null && nodeStorage.getIdListLength() === 0)
                done();
        });
    });

    it('should return our node', function (done) {
        nodeStorage.setNodeInformation(dummyNode);
        setTimeout(function () {
            nodeStorage.getRandomNode(function (data) {
                if (JSON.stringify(dummyNode) === data)
                    done();
            });
        }, 10);
    });
});
//# sourceMappingURL=main.js.map
