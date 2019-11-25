const flexbugsFixes = require('postcss-flexbugs-fixes'),
    unprefix = require('postcss-unprefix'),
    autoprefixer = require('autoprefixer'),
    pxtorem = require('postcss-pxtorem'),
    comments = require('postcss-discard-comments'),
    rls = require('remove-leading-slash'),
    fs = require('fs-extra'),
    sasslint = require('sass-lint'),
    config = require('../../frontendboilerplate-configuration'),
    glob = require('glob'),
    upath = require('upath'),
    log = require('./log'),
    process = require('process'),
    magicImporter = require('node-sass-magic-importer'),
    sass = require('node-sass'),
    Datauri = require('datauri'),
    notifier = require('node-notifier'),
    postcss = require('postcss'),
    sizeOf = require('image-size'),
    colors = require('colors'),
    argv = require('minimist')(process.argv.slice(2));

var plugins = [
    comments({
        removeAll: !argv.dev
    }),
    flexbugsFixes(),
    unprefix(),
    autoprefixer({
        cascade: false
    })
];

var pluginsWithPxToRem = [
    comments({
        removeAll: true
    }),
    flexbugsFixes(),
    unprefix(),
    autoprefixer({
        cascade: false
    }),
    pxtorem({
        rootValue: 16,
        propList: ['*'],
        replace: true,
        mediaQuery: false
    }, {
        map: true
    })
];

module.exports = {
    generate: function (source, destination, base64_node_modules, transformPxToRem_prod, transformPxToRem_dev, echo) {
        var success = true;
        var cssResult = false;
        var sourcemap = false;
        if (argv.dev && destination) {
            sourcemap = rls(upath.join(destination, upath.basename(source).replace(/\.scss|\.sass/, '') + '.css.map'));
        }
        try {
            var outFile = false;
            if (destination) {
                outFile = rls(upath.join(destination, upath.basename(source).replace(/\.scss|\.sass/, '') + '.css'));
            }
            var result = sass.renderSync({
                file: source,
                includePaths: [require('bourbon').includePaths],
                importer: [
                    magicImporter(),
                    function autoBase64nodemoduleStuffs(url, prev) {
                        if (base64_node_modules) {
                            if (base64_node_modules > 0) {
                                url = rls(url);
                                if (url.indexOf('node_modules') > -1) {
                                    var filepath = rls(upath.relative(upath.resolve(__dirname, '..', '..', '..'), upath.resolve(upath.resolve(prev, '..'), url)));
                                    var fileext = upath.extname(filepath);
                                    if (fileext == '.scss') {
                                        return null;
                                    } else if (fileext == '.sass') {
                                        return null;
                                    }
                                    if (fileext != '.css') {
                                        filepath = filepath + '.css';
                                        fileext = '.css';
                                    }
                                    if (fs.pathExistsSync(filepath)) {
                                        if (fileext == '.css') {
                                            var filecontent = fs.readFileSync(filepath, 'utf8');
                                            var regex = new RegExp('url\\(.*?\\)', 'gmiu');
                                            var matches = filecontent.match(regex);
                                            if (matches !== null) {
                                                matches.forEach(function (elem) {
                                                    var url = elem.replace(new RegExp('url', 'g'), '').replace(new RegExp('\'', 'g'), '').replace(new RegExp('"', 'g'), '').replace(new RegExp('\\(', 'g'), '').replace(new RegExp('\\)', 'g'), '').trim();
                                                    var indexOfHash = url.lastIndexOf('?#');
                                                    if (indexOfHash > -1) {
                                                        url = url.substr(0, indexOfHash);
                                                    }
                                                    indexOfHash = url.lastIndexOf('#');
                                                    if (indexOfHash > -1) {
                                                        url = url.substr(0, indexOfHash);
                                                    }
                                                    url = upath.resolve(upath.dirname(filepath), url.trim());
                                                    if (fs.pathExistsSync(url)) {
                                                        var weight = fs.statSync(url).size;
                                                        if (weight <= base64_node_modules * 1000) {
                                                            let datauri = new Datauri(url);
                                                            filecontent = filecontent.split(elem).join('url(' + datauri.content + ')');
                                                        } else {
                                                            if (echo) {
                                                                log.warn({
                                                                    title: 'SASS compilation warning',
                                                                    msg: 'WARNING! The asset ' + url + ' won\'t be base64 encoded because it exceeds the weight limit of ' + base64_node_modules + ' KB. You may want to increase this limit set in the boilerplate-includes/frontendboilerplate-configuration.js or copy the asset relatively to the final .css file.',
                                                                    additionnalData: source
                                                                });
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                            return {
                                                contents: filecontent
                                            };
                                        } else {
                                            return null;
                                        }
                                    } else {
                                        success = false;
                                        if (echo) {
                                            log.error({
                                                title: 'SASS compilation Error',
                                                msg: 'A file is missing',
                                                additionnalData: filepath
                                            });
                                        }
                                        return null;
                                    }
                                } else {
                                    return null;
                                }
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    }
                ],
                sourceMap: sourcemap,
                outFile: outFile,
                outputStyle: 'compressed',
                sourceMapContents: true,
                functions: {
                    'data-inline-svg($content)': function (content) {
                        const datauri = new Datauri();
                        datauri.format('.svg', content.getValue());
                        return new sass.types.String(datauri.content);
                    },
                    'data-inline-file($filepath)': function (filepath) {
                        var relativePath = rls(filepath.getValue());
                        var finalContent = '';
                        if (fs.pathExistsSync(relativePath)) {
                            let datauri = new Datauri(relativePath);
                            finalContent = datauri.content;
                        } else {
                            success = false;
                            if (echo) {
                                log.error({
                                    title: 'SASS compilation Error',
                                    msg: 'A file is missing',
                                    additionnalData: relativePath
                                });
                            }
                        }
                        return new sass.types.String(finalContent);
                    },
                    'image-width($filepath)': function (filepath) {
                        var relativePath = rls(filepath.getValue());
                        var finalContent = '';
                        if (fs.pathExistsSync(relativePath)) {
                            var dimensions = sizeOf(relativePath);
                            finalContent = dimensions.width + 'px';
                        } else {
                            success = false;
                            if (echo) {
                                log.error({
                                    title: 'SASS compilation Error',
                                    msg: 'A file is missing',
                                    additionnalData: relativePath
                                });
                            }
                        }
                        return new sass.types.String(finalContent);
                    },
                    'image-height($filepath)': function (filepath) {
                        var relativePath = rls(filepath.getValue());
                        var finalContent = '';
                        if (fs.pathExistsSync(relativePath)) {
                            var dimensions = sizeOf(relativePath);
                            finalContent = dimensions.height + 'px';
                        } else {
                            success = false;
                            if (echo) {
                                log.error({
                                    title: 'SASS compilation Error',
                                    msg: 'A file is missing',
                                    additionnalData: relativePath
                                });
                            }
                        }
                        return new sass.types.String(finalContent);
                    }
                }
            });
            var cssContent = result.css.toString();
            var mapOptions = null;
            if (argv.dev && destination) {
                var mapContent = result.map.toString();
                mapOptions = {
                    inline: false,
                    prev: result.map.toString(),
                    sourcesContent: true
                }
            }
            try {
                var postCssResult;
                if ((!argv.dev && transformPxToRem_prod) || (argv.dev && transformPxToRem_dev)) {
                    postCssResult = postcss(pluginsWithPxToRem).process(cssContent, {
                        from: source,
                        to: outFile,
                        map: mapOptions
                    });
                } else {
                    postCssResult = postcss(plugins).process(cssContent, {
                        from: source,
                        to: outFile,
                        map: mapOptions
                    });
                }
                cssContent = postCssResult.css;
                if (argv.dev && destination) {
                    mapContent = postCssResult.map.toString();
                }
                try {
                    cssResult = cssContent;
                    if (destination) {
                        fs.outputFileSync(outFile, cssContent);
                        if (echo) {
                            log.fileHasBeenGenerated(outFile);
                        }
                        if (argv.dev) {
                            fs.outputFileSync(sourcemap, mapContent);
                            if (echo) {
                                log.fileHasBeenGenerated(sourcemap);
                            }
                        }
                    }
                } catch (err) {
                    success = false;
                    if (echo) {
                        log.error({
                            title: 'SASS compilation Error: Cannot update or create file. Please check permissions.',
                            msg: err
                        });
                    }
                }
            } catch (err) {
                success = false;
                if (echo) {
                    log.error({
                        title: 'SASS compilation Error: An error occured during SASS compilation.',
                        msg: err
                    });
                }
            }
        } catch (err) {
            success = false;
            if (echo) {
                log.error({
                    title: 'SASS compilation Error - Please check the syntax in your SCSS files',
                    msg: err.message + ' Line: ' + err.line + ', Column: ' + err.column + ' (Status: ' + err.status + ').',
                    additionnalData: err.file
                });
            }
        } finally {
            return {
                success: success,
                code: cssResult
            };
        }
    },
    check: function (echo, callback) {
        var success = true;
        new Promise(function (resolve) {
            var warnings = [];
            var errors = [];
            glob.sync(rls(upath.join(rls(config.generateCss.src_path), '**', '*.scss'))).forEach(function (file) {
                if (fs.pathExistsSync(file)) {
                    var data = fs.readFileSync(file, 'utf8');
                    var lint = sasslint.lintFileText({
                        'text': data,
                        'format': upath.extname(file).replace('.', ''),
                        'filename': upath.relative(process.cwd(), file)
                    });
                    if (lint.warningCount > 0) {
                        warnings.push(lint);
                    }
                    if (lint.errorCount > 0) {
                        errors.push(lint);
                    }
                }
            });
            if (warnings.length > 0 || errors.length > 0) {
                success = false;
                if (echo) {
                    var errorsAndWarnings = errors.concat(warnings);
                    errorsAndWarnings = errorsAndWarnings.filter(function (elem, pos) {
                        return errorsAndWarnings.indexOf(elem) == pos;
                    });
                    notifier.notify({
                        title: 'Non-compliant CSS code',
                        message: 'Please check the syntax in your SCSS files.',
                        icon: './boilerplate-includes/core/images/fidesio-logo.png'
                    });
                    errorsAndWarnings.forEach(function (lint) {
                        log.break();
                        log.info('Sass compilation: ' + colors.white(lint.filePath) + ' - ' + colors.magenta(lint.errorCount + ' error(s)') + ', ' + colors.magenta(lint.warningCount + ' warning(s)') + '.');
                        lint.messages.forEach(function (message) {
                            var finalLog = '';
                            if (message.severity == 1) {
                                finalLog += 'WARNING';
                            } else {
                                finalLog += 'ERROR';
                            }
                            var ponctuation = '';
                            if (message.message.trim().slice(-1) != '.') {
                                ponctuation = '.';
                            }
                            finalLog += '! ' + message.message.trim() + ponctuation + ' Line: ' + message.line + ', Column: ' + message.column + ' (' + message.ruleId + ').';
                            if (message.severity == 1) {
                                log.yellow(finalLog);
                            } else {
                                log.red(finalLog);
                            }
                        });
                        log.break();
                    });
                }
            }
            resolve(success);
        }).then(function (success) {
            if (callback) {
                callback(success);
            }
        });
    }
};