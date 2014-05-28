/// <reference path='./test.d.ts' />

import http = require('http');

require('should');

import server = require('../server');
import NodeStorage = require('../NodeStorage');
import redis = require('redis');


describe('Server', function () {

	this.timeout(0);

	var id = "0a0000000000000078f406020100000005000000";
	var port = 8888;

	var myServ:http.Server = null;
	var nodeStorage:NodeStorage = null;
	var redisClient = null;

	var dummyNode = {
		"id": id,
		"addresses": [{"ip": "127.0.0.1", "port": 55555}]
	};

	before(function (done) {
		setTimeout(function () {
			var s = server(8888, 1);
			myServ = s.server;
			nodeStorage = s.nodeStorage;
			redisClient = redis.createClient();

			var a = false;
			var b = false;

			redisClient.once('ready', function () {
				redisClient.flushall();
				b = true;
				if (a && b) done();
			});

			redisClient.on('error', function (err) {

			});

			myServ.once('listening', function () {
				a = true;
				if (a && b) done();
			});
		}, 1000);

	});

	after(function (done) {
		if (redisClient) {
			redisClient.quit();
			redisClient.once('end', function () {
				nodeStorage.killRedisServer();

				setTimeout(function (){
					done();
				}, 2500);

			});
		}
		else done();
	});

	it('should successfully send node information to the server', function (done) {

		var req = http.request({
			port: port,
			method: 'POST',
			hostname: '0.0.0.0'
		}, function (res) {
			if (res.statusCode === 202) done();
		});

		req.end(JSON.stringify(dummyNode));

	});

	it('should get a Bad Request response', function (done) {
		var req = http.request({
			port: port,
			method: 'POST',
			hostname: '0.0.0.0'
		}, function (res) {
			if (res.statusCode === 400) done();
		});

		req.end('muschi');
	});

	it('should return a 200 and our node', function (done) {
		var req = http.request({
			port: port,
			method: 'GET',
			hostname: '0.0.0.0'
		}, function (res) {
			var body = '';
			res.on('data', function (data) {
				if (data) body += data;
			});
			res.on('end', function (data) {
				if (data) body += data;

				if (res.statusCode === 200 && body === JSON.stringify(dummyNode)) {
					done();
				}
			})

		});

		req.end();

	});

	it('should return a 404', function (done) {
		setTimeout(function () {
			var req = http.request({
				port: port,
				method: 'GET',
				hostname: '0.0.0.0'
			}, function (res) {
				if (res.statusCode === 404) done();

			});

			req.end();
		}, 1000);
	});


});