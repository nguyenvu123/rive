const argv = require('minimist')(process.argv.slice(2)),
    UglifyJS = require('uglify-js'),
    fs = require('fs-extra'),
    jshint = require('jshint').JSHINT,
    log = require('./log'),
    glob = require('glob'),
    config = require('../../frontendboilerplate-configuration'),
    upath = require('upath'),
    notifier = require('node-notifier'),
    _ = require('lodash'),
    validator = require('is-my-json-valid'),
    modernizr = require('modernizr'),
    tasks = require('./tasks.js'),
    colors = require('colors'),
    rls = require('remove-leading-slash');

var boilerplate_random = parseInt(Math.random() * 10000000);

var javascript = {
    getMainJavascriptFiles: function () {
        return jsFiles = glob.sync(rls(upath.join(rls(config.generateJs.src_path), '**', '*.js')), {
            ignore: [
                '**/_*.js'
            ]
        });
    },
    generate: function (source, echo) {
        var success = true;
        var codeResult = false;
        var src = [];
        var fileConfig = javascript.getFileConfig(source, true);
        if (fileConfig) {
            var output_path;
            if (fileConfig.output_path) {
                output_path = rls(fileConfig.output_path);
            } else {
                output_path = fileConfig.output_path;
            }
            if (!argv.dev && output_path) {
                fs.removeSync(output_path + '.map');
            }
            fileConfig.src.forEach(function (filepath) {
                filepath = rls(filepath);
                if (glob.hasMagic(filepath)) {
                    var files = glob.sync(filepath);
                    if (files.length) {
                        files.forEach(function (file) {
                            src.push(rls(file));
                        });
                    }
                } else {
                    src.push(filepath);
                }
            });
            var boilerplate_display = fileConfig.plugins.boilerplate_display;
            var responsiveImage = fileConfig.plugins.responsiveImage;
            var load_print_css = fileConfig.plugins.load_print_css;
            var lazyloadIframe = fileConfig.plugins.lazyloadIframe;
            var detectNewHtmlElements = fileConfig.plugins.detectNewHtmlElements;
            var dev = fileConfig.plugins.dev;
            if (!argv.dev && dev) {
                dev = false;
            }
            if (boilerplate_display) {
                src.unshift(
                    '/node_modules/jquery.resizeend/lib/jquery.resizeend.min.js',
                    '/node_modules/verge/verge.min.js',
                    'boilerplate-includes/core/js/display.js'
                );
            }
            if (responsiveImage || lazyloadIframe) {
                src.unshift(
                    '/node_modules/intersection-observer/intersection-observer.js'
                );
            }
            var jQuery = fileConfig.jQuery;
            if (jQuery) {
                src.unshift(
                    '/node_modules/jquery/dist/jquery.min.js'
                );
            }
            if (dev) {
                src.push(
                    'boilerplate-includes/core/js/dev.js'
                );
            }
            if (responsiveImage) {
                src.push(
                    'boilerplate-includes/core/plugins/responsive-image/responsive-image.js'
                );
            }
            if (load_print_css) {
                src.push(
                    'boilerplate-includes/core/plugins/load-print-css/load-print-css.js'
                );
            }
            if (lazyloadIframe) {
                src.push(
                    'boilerplate-includes/core/plugins/lazyload-iframe/lazyload-iframe.js'
                );
            }
            if (detectNewHtmlElements) {
                src.push(
                    'boilerplate-includes/core/plugins/detect-new-html-elements/detect-new-html-elements.js'
                );
            }
            for (var i = 0; i < src.length; i++) {
                src[i] = rls(src[i]);
            }
            src = src.filter((v, i, a) => a.indexOf(v) === i);
            var insertBefore = '';
            if (fileConfig.include_random_variable) {
                insertBefore += 'var boilerplate_random = ' + boilerplate_random + ';';
            }
            var modernizrFeatures = javascript.modernizr.getFeaturesForJsFile(source);
            if (modernizrFeatures.length) {
                var addClassesHtml = fileConfig.plugins.modernizr['add-classes-in-html-tag'];
                if (typeof addClassesHtml == 'undefined') {
                    addClassesHtml = false;
                }
                var modernizr_code = javascript.modernizr.getModernizrBuildAccordingToParams(modernizrFeatures, addClassesHtml);
                if (modernizr_code) {
                    insertBefore += modernizr_code;
                } else {
                    if (echo) {
                        log.info('Starting modernizr recompilation...');
                    }
                    javascript.modernizr.generate(function () {
                        if (echo) {
                            log.info('Finished modernizr recompilation.');
                        }
                        tasks.run(['javascript']);
                    });
                }
            }
            var filename = upath.basename(source);
            var code = {};
            src.forEach(function (filePath) {
                if (fs.pathExistsSync(filePath)) {
                    code[filePath] = fs.readFileSync(filePath, 'utf8');
                }
            });
            if (!argv.dev) {
                var result_insertBefore = UglifyJS.minify(insertBefore);
                if (result_insertBefore.error) {
                    success = false;
                    if (echo) {
                        log.error({
                            title: 'JavaScript compilation Error: Please check the syntax in your JS files',
                            msg: result_insertBefore.error
                        });
                    }
                } else {
                    insertBefore = result_insertBefore.code;
                }
            }
            var options = {
                output: {
                    preamble: insertBefore
                }
            };
            if (argv.dev && output_path) {
                options.sourceMap = {
                    filename: filename,
                    url: filename + '.map',
                    root: upath.relative(
                        upath.dirname(output_path),
                        './'
                    )
                };
                options.compress = false;
                options.output.beautify = true;
                options.mangle = false;
                options.output.comments = true;
                options.output.quote_style = 3;
            }
            var result = UglifyJS.minify(code, options);
            if (result.error) {
                success = false;
                if (echo) {
                    log.error({
                        title: 'JavaScript compilation Error: Please check the syntax in your JS files',
                        msg: result.error,
                        additionnalData: source
                    });
                }
            } else {
                codeResult = result.code;
                if (output_path) {
                    try {
                        fs.outputFileSync(output_path, codeResult);
                        if (echo) {
                            log.fileHasBeenGenerated(output_path);
                        }
                        if (argv.dev) {
                            fs.outputFileSync(output_path + '.map', result.map);
                            if (echo) {
                                log.fileHasBeenGenerated(output_path + '.map');
                            }
                        }
                    } catch (err) {
                        success = false;
                        if (echo) {
                            log.error({
                                title: 'JavaScript compilation Error',
                                msg: 'Cannot update or create file. Please check permissions.',
                                additionnalData: output_path
                            });
                        }
                    }
                }
            }
        }
        return {
            success: success,
            code: codeResult
        };
    },
    check: function (echo, callback) {
        var success = true;
        var firstFile = true;
        new Promise(function (resolve) {
            glob.sync(rls(upath.join(rls(config.generateJs.src_path), '**', '_*.js'))).forEach(function (file) {
                if (fs.pathExistsSync(file)) {
                    var data = fs.readFileSync(file, 'utf8');
                    jshint(data);
                    var warningsAndErrors = jshint.errors;
                    if (warningsAndErrors.length > 0) {
                        if (echo) {
                            if (firstFile) {
                                notifier.notify({
                                    title: 'JavaScript compilation Error',
                                    message: 'Please check the syntax in your JavaScript files.',
                                    icon: './boilerplate-includes/core/images/fidesio-logo.png'
                                });
                            }
                            var warnings = 0;
                            var errors = 0;
                            warningsAndErrors.forEach(function (lint) {
                                if (lint.id == '(error)') {
                                    errors = errors + 1;
                                } else {
                                    warnings = warnings + 1;
                                }
                            });
                            var message = 'Javascript compilation: ' + colors.white(file) + ' - ' + colors.magenta(errors + ' error(s)') + ', ' + colors.magenta(warnings + ' warning(s)') + '.';
                            log.break();
                            log.info(message);
                            warningsAndErrors.forEach(function (lint) {
                                var finalLog = '';
                                if (lint.id == '(error)') {
                                    finalLog += 'ERROR';
                                } else {
                                    finalLog += 'WARNING';
                                }
                                finalLog += '! ' + lint.reason + ' Line: ' + lint.line + ', Column: ' + lint.character + ' (' + lint.code + '). "' + lint.evidence + '".';
                                if (lint.id == '(error)') {
                                    log.red(finalLog);
                                } else {
                                    log.yellow(finalLog);
                                }
                            });
                            log.break();
                        }
                        if (firstFile) {
                            success = false;
                            firstFile = false;
                        }
                    }
                }
            });
            resolve(success);
        }).then(function (success) {
            if (callback) {
                callback(success);
            }
        });
    },
    getFileConfig: function (file, echo) {
        try {
            delete require.cache[require.resolve(upath.relative(__dirname, file))]
            var fileConfig = require(upath.relative(__dirname, file));
            fileConfig = JSON.parse(JSON.stringify(fileConfig));
            var validate = validator({
                required: true,
                type: 'object',
                properties: {
                    output_path: {
                        required: true
                    },
                    jQuery: {
                        required: true,
                        type: 'boolean'
                    },
                    include_random_variable: {
                        required: true,
                        type: 'boolean'
                    },
                    src: {
                        required: true,
                        type: 'array'
                    },
                    plugins: {
                        required: true,
                        type: 'object'
                    }
                }
            });
            if (validate(fileConfig)) {
                return fileConfig;
            } else {
                throw 'Not valid file';
            }
        } catch (e) {
            if (echo) {
                log.error({
                    title: 'JavaScript compilation Error',
                    msg: 'It is not a valid javascript configuration file',
                    additionnalData: file
                });
            }
            return false;
        }
    },
    modernizr: {
        generate: function (callback) {
            var jsFiles = javascript.getMainJavascriptFiles();
            var modernizr_total = javascript.modernizr.getTotalJsFilesThatWillIncludeModernizrCode();
            var modernizr_count = 0;
            jsFiles.forEach(function (file) {
                var fileConfig = javascript.getFileConfig(file, false);
                if (fileConfig) {
                    var modernizrFeatures = javascript.modernizr.getFeaturesForJsFile(file);
                    if (modernizrFeatures.length) {
                        var options = [];
                        var add_classes_in_html_tag = fileConfig.plugins.modernizr['add-classes-in-html-tag'];
                        if (typeof add_classes_in_html_tag == 'undefined') {
                            add_classes_in_html_tag = false;
                        }
                        if (!javascript.modernizr.getModernizrBuildAccordingToParams(modernizrFeatures, add_classes_in_html_tag)) {
                            if (add_classes_in_html_tag) {
                                options.push('setClasses');
                            }
                            modernizr.build(
                                {
                                    'feature-detects': modernizrFeatures,
                                    minify: !argv.dev,
                                    options: options
                                }, function (modernizr_build) {
                                    modernizr_features_Global.push({
                                        features: modernizrFeatures,
                                        'add-classes-in-html-tag': add_classes_in_html_tag,
                                        code: modernizr_build
                                    });
                                    modernizr_count++;
                                }
                            );
                        } else {
                            modernizr_count++;
                        }
                    }
                }
            });
            if (modernizr_total > 0) {
                var interval_callback = function () {
                    if (modernizr_total == modernizr_count) {
                        clearInterval(interval);
                        if (callback) {
                            callback();
                        }
                    }
                };
                var interval = setInterval(interval_callback, 500);
            } else {
                if (callback) {
                    callback();
                }
            }
        },
        getFeaturesForJsFile: function (file) {
            var modernizrFeatures = [];
            var fileConfig = javascript.getFileConfig(file, false);
            if (fileConfig) {
                var features = fileConfig.plugins.modernizr['feature-detects'];
                var detectNewHtmlElements = fileConfig.plugins.detectNewHtmlElements;
                var responsiveImage = fileConfig.plugins.responsiveImage;
                var lazyloadIframe = fileConfig.plugins.lazyloadIframe;
                if (responsiveImage) {
                    modernizrFeatures.push('test/dom/mutationObserver', 'test/customevent', 'test/img/srcset');
                }
                if (lazyloadIframe) {
                    modernizrFeatures.push('test/dom/mutationObserver', 'test/customevent');
                }
                if (detectNewHtmlElements) {
                    modernizrFeatures.push('test/dom/mutationObserver');
                }
                features.forEach(function (feature) {
                    modernizrFeatures.push(feature);
                });
                if (modernizrFeatures.length) {
                    modernizrFeatures = _.uniq(modernizrFeatures);
                }
            }
            return modernizrFeatures;
        },
        getTotalJsFilesThatWillIncludeModernizrCode: function () {
            var jsFiles = javascript.getMainJavascriptFiles();
            var modernizr_total = 0;
            jsFiles.forEach(function (file) {
                var modernizrFeatures = javascript.modernizr.getFeaturesForJsFile(file);
                if (modernizrFeatures.length) {
                    modernizr_total++;
                }
            });
            return modernizr_total;
        },
        getModernizrBuildAccordingToParams: function (modernizrFeatures, addClassesHtml) {
            var filtered_modernizr_build = _.filter(modernizr_features_Global, function (modernizr_build) {
                var match = true;
                if (modernizr_build['add-classes-in-html-tag'] != addClassesHtml) {
                    match = false;
                } else {
                    if (modernizr_build.features.length != modernizrFeatures.length) {
                        match = false;
                    } else {
                        modernizrFeatures.forEach(function (modernizrFeature) {
                            if (modernizr_build.features.indexOf(modernizrFeature) == -1) {
                                match = false;
                            }
                        });
                    }
                }
                return match;
            });
            if (filtered_modernizr_build.length) {
                return filtered_modernizr_build[0].code;
            } else {
                return false;
            }
        }
    }
};

module.exports = javascript;