const _ = require('lodash'),
    config = require('../../frontendboilerplate-configuration'),
    log = require('./log'),
    localeCode = require('locale-code');

var configuration = {
    check: function () {
        var success = false;
        if (_.isString(config.project_name)) {
            if (!config.project_name.trim().length) {
                log.error({
                    title: 'Error in configuration file',
                    msg: '"project_name" is mandatory',
                    additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                });
                success = true;
            } else {
                if (config.project_name != config.project_name.trim()) {
                    log.warn({
                        title: 'Possible issue in configuration file',
                        msg: '"project_name" contains unnecessary spaces',
                        additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                    });
                }
                config.project_name = config.project_name.trim();
            }
        } else {
            log.error({
                title: 'Error in configuration file',
                msg: '"project_name" must be a valid string',
                additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
            });
            success = true;
        }
        if (_.isString(config.project_short_name)) {
            if (!config.project_short_name.trim().length) {
                log.error({
                    title: 'Error in configuration file',
                    msg: '"project_short_name" is mandatory',
                    additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                });
                success = true;
            } else {
                if (config.project_short_name.trim().length > 12) {
                    log.error({
                        title: 'Error in configuration file',
                        msg: '"project_short_name" must not exceed 12 characters',
                        additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                    });
                    success = true;
                } else {
                    if (config.project_short_name != config.project_short_name.trim()) {
                        log.warn({
                            title: 'Possible issue in configuration file',
                            msg: '"project_short_name" contains unnecessary spaces',
                            additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                        });
                    }
                    config.project_short_name = config.project_short_name.trim();
                }
            }
        } else {
            log.error({
                title: 'Error in configuration file',
                msg: '"project_short_name" must be a valid string',
                additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
            });
            success = true;
        }
        if (_.isString(config.project_lang)) {
            if (!config.project_lang.trim().length) {
                log.error({
                    title: 'Error in configuration file',
                    msg: '"project_lang" is mandatory',
                    additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                });
                success = true;
            } else {
                var regex = new RegExp('^[a-z]{2}-[A-Z]{2}$', 'gmu');
                if (!localeCode.validateLanguageCode(config.project_lang.trim()) || regex.exec(config.project_lang.trim()) == null) {
                    log.error({
                        title: 'Error in configuration file',
                        msg: '"project_lang" must match the pattern [ll-CC]. Example : en-US, fr-FR',
                        additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                    });
                    success = true;
                } else {
                    if (config.project_lang != config.project_lang.trim()) {
                        log.warn({
                            title: 'Possible issue in configuration file',
                            msg: '"project_lang" contains unnecessary spaces',
                            additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
                        });
                    }
                    config.project_lang = config.project_lang.trim();
                }
            }
        } else {
            log.error({
                title: 'Error in configuration file',
                msg: '"project_lang" must be a valid string',
                additionnalData: './boilerplate-includes/frontendboilerplate-configuration.js'
            });
            success = true;
        }
        //to continue...
        return success;
    }
};

module.exports = configuration;