var express = require('express');
var app = express.createServer();
app.use(express.static(__dirname + '/static'));
app.listen(8080);
console.log('Listening on 8080');

app.get('/', function (req, res) {
    res.render('index.jade', { layout : false });
});

var browserify = require('browserify');
var bundle = browserify({
    entry : __dirname + '/js/main.js',
    require : [ 'jade' ]
});
app.use(bundle);

var browserifyFile = require('browserify-file');
bundle.use(browserifyFile('views', __dirname + '/views'));
