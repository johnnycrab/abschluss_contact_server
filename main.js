/// <reference path="./ts-definitions/node/node.d.ts" />
/// <reference path="./ts-definitions/node_redis/node_redis.d.ts" />
var redis = require('redis');

var keyExpiryInMs = 3600000;

var client = redis.createClient();
//# sourceMappingURL=main.js.map
