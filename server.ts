/// <reference path="./ts-definitions/node/node.d.ts" />


import NodeStorage = require('./NodeStorage');
import http = require('http');

var exportFunc = function (port:number, ttl:number):any {
	var nodeStorage:NodeStorage = new NodeStorage(ttl);

	var server = http.createServer(function (request:http.ServerRequest, response:http.ServerResponse) {

		if (request.method === 'GET') {
			// return a random node
			nodeStorage.getRandomNode(function (nodeString:string) {
				if (!nodeString) {
					response.statusCode = 404;
					response.end();
				}
				else {
					response.statusCode = 200;
					response.setHeader('Content-type', 'application/json');
					response.end(nodeString, 'utf8');
				}
			});
		}
		else if (request.method === 'POST') {
			var body = '';

			request.on('data', function (data) {
				if (data) body += data;
			});
			request.on('end', function (data) {
				if (data) body += data;

				try {
					var jsonObject = JSON.parse(body);
					nodeStorage.setNodeInformation(jsonObject);
					response.statusCode = 202;
					response.end();
				}
				catch (e) {
					response.statusCode = 400;
					response.end();
				}
			})
		}


	});

	server.on('listening', function () {
		console.log('Server listening on ' + server.address().address + ':' + server.address().port);
	});

	nodeStorage.on('ready', function () {
		console.log('Node storage set up, starting server...');

		process.nextTick(function () {
			server.listen(port);
		});
	});

	return {
		server: server,
		nodeStorage: nodeStorage
	};
};

export = exportFunc;


