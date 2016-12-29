var express = require('express');
var app = express();
var root = __dirname;
var url = require('url');
var users = [];
var server = require('http').createServer(app);

app.use(function(req, res, next) {
	res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	res.setHeader("Pragma", "no-cache");
	next();
});

app.use(express.static(root));
//app.use(fallback('index.html', {root: root}));
var port = process.env.PORT || 3000;
server.listen(port, function(err) {
	if (!err) {
		console.log('Listening at port:', port);
	}
});