var fs = require('fs');
var path = require('path');
var findit = require('findit');
var Seq = require('seq');

module.exports = function (name, dir, ext) {
    if (!name) throw new Error('Name required');
    if (!dir) throw new Error('Directory or files required');
    
    return function (bundle) {
        var files = findit.sync(dir).filter(function (absfile) {
            var file = absfile.replace(dir.match(/\/$/) ? dir : dir + '/', '');
            var e = (file.match(/\.([^\/.]+)$/) || [,''])[1];
            
            if (typeof ext === 'function' && ext(file, e)) {
                return true;
            }
            else if (file.split('/').some(function (p) {
                return p.match(/^\./)
            })) {
                // hidden files and directories
                return false;
            }
            else if (Array.isArray(ext) && ext.indexOf(e) >= 0) {
                return true;
            }
            else if (typeof ext === 'string' && e === ext) {
                return true;
            }
            else if (!ext) {
                return true;
            }
        });
        
        var bodies = files.reduce(function (acc, file) {
            var rel = file.slice(dir.length);
            acc[rel] = fs.readFileSync(file, 'utf8');
            return acc;
        }, {});
        
        bundle.register(function (body, file) {
            if (file === __dirname + '/browser/files.js') {
                return body.replace(/\$bodies/, function () {
                    return JSON.stringify(bodies);
                });
            }
            else return body;
        });
        
        bundle.require(__dirname + '/browser/files.js');
    };
};
