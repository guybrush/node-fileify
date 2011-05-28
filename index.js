var fs = require('fs');
var path = require('path');
var findit = require('findit');
var Seq = require('seq');

var wrapper = fs.readFileSync(__dirname + '/wrapper.js');

module.exports = function (name, dir, ext) {
    if (!name) throw new Error('Name required');
    if (!dir) throw new Error('Directory or files required');
    
    return function (src, next) {
        var find = findit(dir);
        
        var files = [];
        
        find.on('file', function (file) {
            var e = (file.match(/\.([^\/.]+)$/) || [,''])[1];
            
            if (typeof ext === 'function' && ext(file, e)) {
                files.push(file);
            }
            else if (!path.basename(file).match(/^\./)) {
                // nop for hidden files
            }
            else if (Array.isArray(ext) && ext.indexOf(e) >= 0) {
                files.push(file);
            }
            else if (typeof ext === 'string' && e === ext) {
                files.push(file);
            }
            else if (!ext) {
                files.push(file);
            }
        });
        
        find.on('end', function () {
            Seq.ap(files)
                .parEach(15, function (file) {
                    var relfile = file.replace(
                        dir.match(/\/$/) ? dir : dir + '/', ''
                    );
                    fs.readFile(file, this.into(relfile));
                })
                .seq(function () {
                    var vars = this.vars;
                    next(
                        wrapper
                            .replace('$vars', function () {
                                return JSON.stringify(vars)
                            })
                            .replace('$name', function () {
                                return JSON.stringify(name)
                            })
                        + src
                    );
                })
            ;
        });
    };
};
