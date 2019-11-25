/*
 * @file
 *
 * Creates and attach favicon files.
 *
 */

const config = require('../../../frontendboilerplate-configuration'),
    log = require('../log'),
    prompt = require('prompt'),
    argv = require('minimist')(process.argv.slice(2)),
    _ = require('lodash'),
    favicon = require('../favicon'),
    rls = require('remove-leading-slash');

module.exports = function (done) {
    var success = true;
    log.break();
    log.info('Project\'s short name is : ' + config.project_short_name);
    log.info('Langage code is : ' + config.project_lang);
    log.info('Source file is : ' + rls(config.generateFavicon.src));
    log.info('Output directory is : ' + rls(config.generateFavicon.output));
    log.info('Favicon\s main color is : ' + config.generateFavicon.main_color);
    log.break();
    var minify = false;
    if (argv['skip-prompt']) {
        if (!argv.dev) {
            minify = true;
            log.info('Optimising generated favicons may take some time (1 to 2 minutes).');
            log.info('Generated images will be optimised. Consider using --dev to skip image optimisation.');
        } else {
            log.info('Generated images will NOT be optimised because of --dev.');
        }
        log.info('Starting favicons generation...');
        favicon.generate(minify, function (result) {
            success = result;
            done(success);
            prompt.stop();
        });
    } else {
        log.info('Do you confirm?');
        var schema = {
            properties : {
                'yes/no' : {
                    pattern : /^yes|no|y|n|YES|NO|Y|N+$/,
                    type : 'string',
                    message : 'We didn\'t understand your answer.',
                    required : true
                }
            }
        };
        prompt.start();
        prompt.get(schema, function (err, result) {
            if (err) {
                err = '' + err;
                success = false;
                if (!_.includes(err, 'Error: canceled')) {
                    log.break();
                    log.red(err);
                    log.break();
                }
                done(success);
                prompt.stop();
            } else {
                if (result['yes/no'].match(/^yes|y|YES|Y+$/) != null) {
                    log.info('Optimising generated favicons may take some time (1 to 2 minutes).');
                    log.info('Do you want to optimise generated images?');
                    prompt.start();
                    prompt.get(schema, function (err, result) {
                        if (err) {
                            err = '' + err;
                            success = false;
                            if (!_.includes(err, 'Error: canceled')) {
                                log.break();
                                log.red(err);
                                log.break();
                            }
                            done(success);
                            prompt.stop();
                        } else {
                            if (result['yes/no'].match(/^yes|y|YES|Y+$/) != null) {
                                minify = true;
                            }
                            log.info('Starting favicons generation...');
                            favicon.generate(minify, function (result) {
                                success = result;
                                done(success);
                                prompt.stop();
                            });
                        }
                    });
                } else {
                    done(success);
                    prompt.stop();
                }
            }
        });
    }
};