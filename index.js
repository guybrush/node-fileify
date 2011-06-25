var fs = require('fs');
var path = require('path');
var findit = require('findit');
var Seq = require('seq');

module.exports = function (target, dir, ext) {
    if (!target) throw new Error('Target name required');
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
        
        var file = __dirname + '/browser/files.js';
        var body = fs.readFileSync(file, 'utf8')
            .replace(/\$bodies/, function () {
                return JSON.stringify(bodies);
            })
        ;
        bundle.include(file, path.normalize('/node_modules/' + target), body);
    };
};
