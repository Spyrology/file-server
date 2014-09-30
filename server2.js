var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var qs = require('querystring');
var root = __dirname;
var items = [];


var server = http.createServer(function (req, res) {
	if(req.url == '/') {
		switch (req.method) {
			case 'GET':
				req.url = '/index.html';
				items.forEach(function (item, i) {
				res.write(i + '. ' + item + '\n');
				});
				res.end();
			break;
			case 'POST':
				var item = '';
				req.setEncoding('utf8');
				req.on('data', function(chunk) {
					item += chunk;
				});
				req.on('end', function () {
					var obj = qs.parse(item);
					items.push(obj.item);
					res.end('The item: "' + obj.item + '" was added successfully');
				});
			break;
			case 'DELETE':
				var pathname = url.parse(req.url).pathname;
				var i = parseInt(pathname.slice(1), 10);

				if (isNaN(i)) {
					res.statusCode = 400;
					res.end('Item id not valid');
				}
				else if (!items[i]) {
					res.statusCode = 404;
					res.end('Item not found');
				}
				else {
					items.splice(i, 1);
					res.end('Item deleted successfully');
				}
			break;
			case 'PUT':
				var item = '';
				var pathname = url.parse(req.url).pathname;
				var i = parseInt(pathname.slice(1), 10);

				if (isNaN(i)) {
					res.statusCode = 400;
					res.end('Item id not valid');
				}
				else if (!items[i]) {
					res.statusCode = 404;
					res.end('Item id not found');
				}
				else {
					req.on('data', function (chunk) {
						item += chunk;
					});
					req.on('end', function () {
						items.splice(i, 1, item);
						res.end('Item updated successfully');
					});
				}
			break;
		}
	}
	var url = parse(req.url);
	var path = join(root, url.pathname);
	fs.stat(path, function (err, stat) {
		if (err) {
			if (err.code == 'ENOENT') {
				res.statusCode = 404;
				res.end('File Not Found');
			}
			else {
				res.statusCode = 500;
				res.end('Internal Server Error');
			}
		}
		else {
			var stream = fs.createReadStream(path);
			res.setHeader('Content-length', stat.size);
			stream.pipe(res);
			stream.on('error', function (err) {
				res.statusCode = 500;
				res.end('Internal Server Error');
			});
		}
	});
});

server.listen(9000, function() {
	console.log('listening on 9000');
});