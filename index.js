var fs = require('fs');
var path = require('path');
var findit = require('findit');
var Seq = require('seq');

module.exports = function (target, dir, optsOrEx) {
    if (!target) throw new Error('Target name required');
    if (!dir) throw new Error('Directory or files required');
    
    var opts = typeof optsOrEx === 'object' && !Array.isArray(optsOrEx)
        ? optsOrEx
        : { extension : optsOrEx }
    ;
    
    var filter = function (file) {
        var ext = path.extname(file);
        if (!opts.extension) {
            return true;
        }
        else if (typeof opts.extension === 'function') {
            return opts.extension(file);
        }
        else if (typeof opts.extension === 'string') {
            return opts.extension === ext;
        }
        else if (Array.isArray(opts.extension)) {
            return opts.extension.some(function (e) { return e === ext });
        }
        else {
            return true;
        }
    };
    
    return function (bundle) {
        var files = [];
        
        findit.sync(dir, function (file, stat) {
            if (stat.isDirectory()) {
                if (opts.watch) {
                    fs.watchFile(file, function (curr, prev) {
                        
                    });
                }
            }
            else if (filter(file)) {
                var i = files.length;
                files.push(file);
                
                if (opts.watch) {
                    fs.watchFile(file, function (curr, prev) {
                        
                    });
                }
            }
        });
        
        var include = function (files) {
            var dst = path.normalize('/node_modules/' + target);
            
            Object.keys(bundle.files).forEach(function (key) {
                if (bundle.files[key].target === dst) {
                    delete bundle.files[key];
                }
            });
            
            var bodies = files.reduce(function (acc, file) {
                var rel = file.slice(dir.length + 1);
                acc[rel] = fs.readFileSync(file, 'utf8');
                return acc;
            }, {});
            
            var file = __dirname + '/browser/files.js';
            var body = fs.readFileSync(file, 'utf8')
                .replace(/\$bodies/, function () {
                    return JSON.stringify(bodies);
                })
            ;
            
            bundle.include(null, dst, body);
        };
        include(files);
    };
};

