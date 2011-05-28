var express = require('express');
var app = express.createServer();

app.use(express.static(__dirname));
app.listen(8080);
console.log('Listening on 8080');

var browserify = require('browserify');
var bundle = browserify({
    require : { jquery : 'jquery-browserify' }
});
app.use(bundle);

var browserifyFile = require('browserify-file');
bundle.use(browserifyFile('files', __dirname + '/files'));
