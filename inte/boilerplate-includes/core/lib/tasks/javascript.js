/*
 * @file
 *
 * Builds JavaScript code.
 *
 */

const javascript = require('../javascript'),
    argv = require('minimist')(process.argv.slice(2)),
    config = require('../../../frontendboilerplate-configuration'),
    browserSync = require('browser-sync').get('BrowserSync Frontend Boilerplate : ' + config.project_name);

module.exports = function (done) {
    var jsFiles = javascript.getMainJavascriptFiles();
    if (jsFiles.length) {
        jsFiles.forEach(function (file, index) {
            var result = javascript.generate(file, true);
            if (argv.reload && config.generateHtml.enable && result.success && argv._[0] === 'watch' && browserSync.instance.active) {
                browserSync.stream();
            }
            if (index === jsFiles.length - 1) {
                done();
            }
        });
    } else {
        done();
    }
};