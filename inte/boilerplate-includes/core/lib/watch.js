/*
 * @file
 *
 * Watch files changes.
 *
 */

const config = require('../../frontendboilerplate-configuration'),
    upath = require('upath'),
    glob = require('glob'),
    log = require('./log'),
    _ = require('lodash'),
    extension = require('./extension'),
    tasks = require('./tasks.js'),
    rls = require('remove-leading-slash'),
    browserSync = require('browser-sync').get('BrowserSync Frontend Boilerplate : ' + config.project_name),
    chokidar = require('chokidar'),
    fs = require('fs-extra'),
    tcpPortUsed = require('tcp-port-used'),
    colors = require('colors');

var watch = {
    watchFiles: function (filesToWatch, callback) {
        if (typeof filesToWatch != 'object') {
            filesToWatch = [filesToWatch];
        }
        filesToWatch.forEach(function (fileToWatch) {
            fileToWatch = upath.normalize(rls(fileToWatch));
            chokidar.watch(fileToWatch, {
                recursive: true,
                usePolling: true,
                alwaysStat: true
            }).on('change', function (name, stats) {
                if (callback) {
                    if (typeof stats !== 'undefined') {
                        stats = stats.size;
                    }
                    callback(name, stats);
                }
            }).on('unlink', function (name, stats) {
                if (callback) {
                    if (typeof stats !== 'undefined') {
                        stats = stats.size;
                    }
                    callback(name, stats);
                }
            }).on('unlinkDir', function (name, stats) {
                if (callback) {
                    if (typeof stats !== 'undefined') {
                        stats = stats.size;
                    }
                    callback(name, stats);
                }
            });
        });
    },
    init: function () {
        log.info('Starting watching files...');
        setTimeout(function () {
            log.info('I know you must be tired, Princess. So I will let you rest.');
            process.exit(0);
        }, 86400000);
        if (
            config.generateHtml.enable ||
            config.extension_mode ||
            config.generateJs.enable ||
            config.generateCss.enable
        ) {
            if (config.generateHtml.enable) {
                var startPath = upath.join(rls(config.generateHtml.output), 'index.html');
                if (!config.generateHtml.browsersync.enable) {
                    startPath = false;
                }
                if (!config.generateHtml.enable_index && startPath) {
                    startPath = false;
                    var htmlFiles = glob.sync(rls(upath.join(rls(config.generateHtml.src), '**', '*.twig')), {
                        ignore: [
                            '**/_*.twig'
                        ]
                    });
                    if (htmlFiles.length) {
                        var destination = rls(upath.join(rls(config.generateHtml.output), upath.basename(htmlFiles[0], '.twig') + '.html'));
                        var fileContent = fs.readFileSync(htmlFiles[0], 'utf8');
                        var regex = new RegExp("\\{%\\s*set\\s*output_path\\s*=\\s*['\"]?(.+?)['\"]?\\s*%\\}", 'gmiu');
                        var matches = regex.exec(fileContent);
                        if (matches !== null) {
                            destination = rls(upath.join(upath.dirname(destination), rls(matches[1])));
                        }
                        startPath = destination;
                    }
                }
                if (startPath) {
                    function checkIfPortIsUsed(port, callback) {
                        tcpPortUsed.check(port, '127.0.0.1').then(function (inUse) {
                            if (!inUse) {
                                if (callback) {
                                    callback(port);
                                }
                            } else {
                                log.error('Cannot Start BrowserSync because the port ' + port + ' is already in use. Trying with port ' + (port + 1) + '...');
                                checkIfPortIsUsed(port + 1, callback);
                            }
                        });
                    }
                    checkIfPortIsUsed(config.generateHtml.browsersync.port, function (port) {
                        var browserSync_options = {
                            server: true,
                            startPath: startPath,
                            ui: false,
                            notify: false,
                            logLevel: 'silent',
                            ghostMode: false,
                            minify: true,
                            port: port,
                            callbacks: {
                                ready: function (err, bs) {
                                    log.boilerplateUrls();
                                }
                            }
                        };
                        browserSync.init(browserSync_options);
                    });
                }
            }
            var system_files = [
                './frontendboilerplate.js',
                './package.json',
                './boilerplate-includes/frontendboilerplate-configuration.js',
                './boilerplate-includes/core'
            ];
            watch.watchFiles(system_files, function (name, stats) {
                log.info('Watch has detected changes in ' + upath.normalizeSafe(name));
                log.info('Please restart the Frontend Boilerplate.');
                process.exit(0);
            });
            if (config.extension_mode) {
                var extensionWatchTimer = false;
                watch.watchFiles(config.generateHtml.output, function (name, stats) {
                    if (extensionWatchTimer) {
                        clearTimeout(extensionWatchTimer);
                    }
                    extensionWatchTimer = setTimeout(function () {
                        extension.generate();
                    }, 2000);
                });
            }
            if (config.generateJs.enable) {
                var js_tasks_to_run = ['check-js', 'javascript'];
                if (config.generateHtml.enable) {
                    js_tasks_to_run.push('html');
                }
                if (config.generateGitignore.enable) {
                    js_tasks_to_run.push('gitignore');
                }
                var javascriptFilesToWatch = _.concat([], config.generateJs.additional_paths_to_watch);
                watch.watchFiles(config.generateJs.src_path, function (name, stats) {
                    log.notifyFileHasChanged(name, stats);
                    tasks.run(js_tasks_to_run);
                });
                watch.watchFiles(javascriptFilesToWatch, function (name, stats) {
                    log.notifyFileHasChanged(name, stats);
                    tasks.run(['javascript']);
                });
            }
            if (config.generateCss.enable) {
                var css_tasks_to_run = ['check-scss', 'css'];
                if (config.generateHtml.enable) {
                    css_tasks_to_run.push('html');
                }
                if (config.generateGitignore.enable) {
                    css_tasks_to_run.push('gitignore');
                }
                var cssFilesToWatch = _.concat([], config.generateCss.additional_paths_to_watch);
                watch.watchFiles(config.generateCss.src_path, function (name, stats) {
                    log.notifyFileHasChanged(name, stats);
                    tasks.run(css_tasks_to_run);
                });
                watch.watchFiles(cssFilesToWatch, function (name, stats) {
                    log.notifyFileHasChanged(name, stats);
                    tasks.run(['css']);
                });
            }
            if (config.generateHtml.enable) {
                var html_tasks_to_run = ['html'];
                if (config.generateGitignore.enable) {
                    html_tasks_to_run.push('gitignore');
                }
                var htmlFilesToWatch = _.concat([], config.generateHtml.additional_paths_to_watch);
                watch.watchFiles(config.generateHtml.src, function (name, stats) {
                    log.notifyFileHasChanged(name, stats);
                    tasks.run(html_tasks_to_run);
                });
                watch.watchFiles(htmlFilesToWatch, function (name, stats) {
                    log.notifyFileHasChanged(name, stats);
                    tasks.run(['html']);
                });
            }
        } else {
            log.error({
                title: 'Frontend Boilerplate Error',
                msg: 'You must first enable something to generate in the configuration file.',
                additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
            });
            process.exit(0);
        }
    }
};

module.exports = watch;