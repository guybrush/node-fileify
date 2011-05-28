browserify-file
===============

Middleware for browserify to load non-js files like templates.

methods
=======

var browserifyFile = require('browserify-file');

browserifyFile(name, dir, ext)
------------------------------

Make the files in `dir` available through `require(name)`.

`require(name)` will then return the files hashed by filename.

Optionally you can specify an extension `ext` which can be a filter function,
regexp, or string to match extensions. By default, returns all files.

browserifyFile will do a recursive traversal of `dir` and return all the files
except for hidden ones unless you specify a callback for `ext`.

example
=======

simple/server.js

````javascript
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
````

````html
<html>
  <head>
    <script type="text/javascript" src="/browserify.js"></script>
    <script type="text/javascript">
      var files = require('files')
      var $ = require('jquery');
      
      window.onload = function () {
        Object.keys(files).forEach(function (name) {
          var div = $('<div>').appendTo($('#files'));
          
          $('<div>')
            .text(name)
            .appendTo(div)
          ;
          $('<textarea>')
            .val(files[name])
            .appendTo(div)
          ;
        });
      };
    </script>
  </head>
  <body>
    <div id="files"></div>
  </body>
</html>
````

license
=======

MIT/X11
