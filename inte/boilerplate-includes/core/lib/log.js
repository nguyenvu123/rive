const fancyLog = require('fancy-log'),
    colors = require('colors'),
    rls = require('remove-leading-slash'),
    config = require('../../frontendboilerplate-configuration'),
    upath = require('upath'),
    browserSync = require('browser-sync').get('BrowserSync Frontend Boilerplate : ' + config.project_name),
    argv = require('minimist')(process.argv.slice(2)),
    bytes = require('bytes'),
    notifier = require('node-notifier'),
    pjson = require('../../../package.json');

var log = {
    error: function (options) {
        if (typeof options == 'string' || typeof options != 'object') {
            notifier.notify({
                title: 'An error has occured',
                message: options,
                icon: './boilerplate-includes/core/images/fidesio-logo.png'
            });
            log.break();
            fancyLog(colors.red(options));
            log.break();
        } else {
            notifier.notify({
                title: options.title,
                message: options.msg,
                icon: './boilerplate-includes/core/images/fidesio-logo.png'
            });
            log.break();
            var fullMsg = options.title;
            if (_.has(options, 'additionnalData')) {
                if (options.additionnalData) {
                    fullMsg += ': ' + colors.magenta(options.additionnalData);
                }
            }
            log.info(fullMsg);
            fancyLog(colors.red(options.msg));
            log.break();
        }
    },
    warn: function (options) {
        if (typeof options == 'string' || typeof options != 'object') {
            log.break();
            fancyLog(colors.yellow(options));
            log.break();
        } else {
            log.break();
            var fullMsg = options.title;
            if (_.has(options, 'additionnalData')) {
                if (options.additionnalData) {
                    fullMsg += ': ' + colors.magenta(options.additionnalData);
                }
            }
            log.info(fullMsg);
            fancyLog(colors.yellow(options.msg));
            log.break();
        }
    },
    yellow: function (msg) {
        fancyLog(colors.yellow(msg));
    },
    red: function (msg) {
        fancyLog(colors.red(msg));
    },
    info: function (msg) {
        fancyLog(colors.green(msg));
    },
    normal: function (msg) {
        fancyLog(colors.white(msg));
    },
    break: function () {
        fancyLog(' ');
    },
    fileHasBeenGenerated: function (path) {
        fancyLog(colors.white('Generating file ' + path + ' ✓'));
    },
    indexHtmlLocation: function (spaceAtbeginning = false) {
        if (config.generateHtml.enable && config.generateHtml.enable_index) {
            var msg = '';
            if (spaceAtbeginning) {
                msg += ' ';
            }
            log.yellow(msg + colors.white('index.html: ') + colors.magenta(upath.join(__dirname, rls(config.generateHtml.output), 'index.html')));
        }
    },
    boilerplateUrls: function () {
        if (browserSync.instance.active && config.generateHtml.enable) {
            var browserSyncUrls = browserSync.getOption('urls');
            log.yellow(colors.white('[') + colors.cyan('Browsersync') + colors.white(']') + colors.white(' Using port: ') + colors.magenta(browserSync.getOption('port')));
            log.yellow(colors.white('[') + colors.cyan('Browsersync') + colors.white(']') + colors.white(' Access URLs:'));
            log.yellow(colors.grey(' ----------------------------------------------------'));
            log.yellow(colors.white('      Local: ') + colors.magenta(browserSyncUrls.get('local')));
            log.yellow(colors.white('   External: ') + colors.magenta(browserSyncUrls.get('external')));
            log.indexHtmlLocation(true);
            log.yellow(colors.grey(' ----------------------------------------------------'));
            log.yellow(colors.white('[') + colors.cyan('Browsersync') + colors.white('] Serving files from: ') + colors.magenta('./'));
        } else if (config.generateHtml.enable) {
            log.indexHtmlLocation();
        }
    },
    noticeDevProd: function () {
        fancyLog(colors.magenta('Frontend Boilerplate V' + pjson.version + ' - ' + pjson.release_date));
        fancyLog(colors.white('Please report bugs: ') + colors.cyan('https://git.fidesio.com/fidesio/frontend-boilerplate/issues'));
        if (!argv._.length || argv._[0] === 'watch' || argv._[0] === 'css' || argv._[0] === 'javascript' || argv._[0] === 'html') {
            if (argv.dev) {
                process.env.NODE_ENV = 'development';
                log.yellow('Notice : Consider using the --dev option for development and testing purposes only.');
            } else {
                process.env.NODE_ENV = 'production';
                log.yellow('Notice : Consider using the --dev option for development and testing purposes.');
            }
        }
        if (argv._[0] === 'watch' && !argv.reload && config.generateHtml.enable) {
            log.yellow('Notice : Consider using the --reload option to automatically reload browser when changes are detected.');
        }
        if (!argv._.length || argv._[0] === 'watch' || argv._[0] === 'css' || argv._[0] === 'javascript' || argv._[0] === 'html') {
            fancyLog(colors.white('FRONTEND BOILERPLATE MODE: ') + colors.green(process.env.NODE_ENV.toUpperCase()));
        }
    },
    notifyFileHasChanged: function (name, size = false) {
        if (argv.reload && config.generateHtml.enable) {
            if (size) {
                log.yellow('File ' + upath.normalizeSafe(name) + ' has changed size to ' + bytes(size, {
                    thousandsSeparator: ' '
                }) + '. Reloading browser and running tasks...');
            } else {
                log.yellow('File ' + upath.normalizeSafe(name) + ' has changed. Reloading browser and running tasks...');
            }
        } else {
            if (size) {
                log.yellow('File ' + upath.normalizeSafe(name) + ' has changed size to ' + bytes(size, {
                    thousandsSeparator: ' '
                }) + '. Running tasks...');
            } else {
                log.yellow('File ' + upath.normalizeSafe(name) + ' has changed. Running tasks...');
            }
        }
    }
};

module.exports = log;