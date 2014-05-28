/// <reference path="./ts-definitions/node/node.d.ts" />


import NodeStorage = require('./NodeStorage');
import http = require('http');

var nodeStorage:NodeStorage = new NodeStorage(3600);
var port:number = 8888;

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

nodeStorage.on('ready', function () {
	console.log('Node storage set up, starting server...');

	server.listen(port, function () {
		console.log('Server listening on port ' + port);
	});
});

