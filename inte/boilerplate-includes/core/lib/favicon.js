const config = require('../../frontendboilerplate-configuration'),
    log = require('./log'),
    image = require('./image'),
    upath = require('upath'),
    pjson = require('../../../package.json'),
    favicons = require('favicons'),
    fs = require('fs-extra'),
    events = require('events'),
    _ = require('lodash'),
    rls = require('remove-leading-slash');

module.exports = {
    generate: function (minify, callback) {
        var success = true;
        favicons(rls(config.generateFavicon.src), {
            path: '/' + upath.relative(rls(config.project_root_directory), rls(config.generateFavicon.output)),
            appName: config.project_short_name,
            display: 'standalone',
            orientation: 'any',
            version: pjson.version,
            replace: true,
            dir: 'auto',
            start_url: '/?utm_source=homescreen',
            pipeHTML: false,
            logging: true,
            developerName: pjson.author.name,
            developerURL: pjson.author.url,
            background: 'transparent',
            theme_color: config.generateFavicon.main_color,
            lang: config.project_lang
        }, function (error, response) {
            if (error) {
                log.error({
                    title: 'Error during favicons generation.',
                    msg: error.message,
                });
                success = false;
                callback(success);
            }
            _.forIn(response.files, function (file) {
                try {
                    fs.outputFileSync(upath.join(rls(config.generateFavicon.output), file.name), file.contents);
                } catch (err) {
                    log.error({
                        title: 'Possible permission Error',
                        msg: 'Cannot update or create file. Please check permissions',
                        additionnalData: upath.join(rls(config.generateFavicon.output), file.name)
                    });
                    success = false;
                    callback(success);
                }
            });
            var images_compiled_count = 0;
            _.forIn(response.images, function (file) {
                try {
                    fs.outputFileSync(upath.join(rls(config.generateFavicon.output), file.name), file.contents, {
                        encoding: 'binary'
                    });
                    if (minify) {
                        const eventEmitter = new events.EventEmitter();
                        eventEmitter.on('finished', function (source) {
                            images_compiled_count++;
                            if (images_compiled_count == response.images.length) {
                                callback(success);
                            }
                        });
                        image.minify(upath.join(rls(config.generateFavicon.output), file.name), true, true, eventEmitter);
                    } else {
                        images_compiled_count++;
                    }
                } catch (err) {
                    log.error({
                        title: 'Possible permission Error',
                        msg: 'Cannot update or create file. Please check permissions',
                        additionnalData: upath.join(rls(config.generateFavicon.output), file.name)
                    });
                    success = false;
                    callback(success);
                }
            });
            if (images_compiled_count == response.images.length) {
                callback(success);
            }
        });
    }
};