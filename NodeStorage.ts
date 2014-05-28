/// <reference path="./ts-definitions/node/node.d.ts" />
/// <reference path="./ts-definitions/node_redis/node_redis.d.ts" />

import events = require('events');
import redis = require('redis');

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

class NodeStorage extends events.EventEmitter {

	private _redisClient:redis.RedisClient = null;
	private _keyExpiryInSeconds:number = 3600 * 1000;
	private _isReadWritable:boolean = false;

	private _idListKey:string = 'idlist';
	private _idListLength:number = null;


	constructor (keyExpiryInSeconds:number) {

		super();

		this._keyExpiryInSeconds = keyExpiryInSeconds;
		this._redisClient = redis.createClient();

		this._redisClient.on('error', function (err) {
			console.log('Redis error: ' + err);
		});

		this._redisClient.on('ready', () => {
			this._isReadWritable = true;
			this.emit('ready');
		});

		this._redisClient.on('end', () => {
			this._isReadWritable = false;
		});
	}

	public getIdListLength ():number {
		return this._idListLength;
	}

	public setNodeInformation (jsonObject):void {
		if (this._isReadWritable) {
			var id = jsonObject.id;
			var addresses = jsonObject.addresses;

			if (id.length === 40 && (addresses instanceof Array === true) && addresses.length) {
				var stringToWrite = JSON.stringify(jsonObject);

				// check if an entry with the id already exists
				this._redisClient.get(id, (err, res) => {
					if (!err) {

						// does not exist. add it to the list
						if (!res) {
							this._redisClient.lpush(this._idListKey, id, (err, res) => {
								if (!err) {
									this._idListLength = res;
								}
							});
						}

						this._redisClient.set(id, stringToWrite, redis.print);
						this._redisClient.expire(id, this._keyExpiryInSeconds, redis.print);
					}
				});
			}
		}

	}

	public getRandomNode (callback:(nodeString:string) => any) {
		if (!this._idListLength) {
			callback(null);
			return;
		}

		var randomIndex:number = Math.floor(Math.random() * this._idListLength);

		this._redisClient.lindex(this._idListKey, randomIndex, (err, id) => {
			if (err) {
				callback(null);
				return;
			}

			this._redisClient.get(id, (err, nodeData) => {
				if (err) {
					callback(null);
					return;
				}

				if (!nodeData) {
					// remove from the list
					this._redisClient.lrem(this._idListKey, 0, id, (err, numOfRemovedElements) => {
						if (numOfRemovedElements) {
							this._idListLength -= numOfRemovedElements;
						}
						this.getRandomNode(callback);
					});
				}
				else {
					callback(nodeData);
				}
			});
		});
	}

}


export = NodeStorage;