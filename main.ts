/// <reference path="./ts-definitions/node/node.d.ts" />
/// <reference path="./ts-definitions/node_redis/node_redis.d.ts" />

import redis = require('redis');

var keyExpiryInMs = 3600000; // one hour

var client = redis.createClient();
