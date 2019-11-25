//BrowserSync create ID
const config = require('./boilerplate-includes/frontendboilerplate-configuration'),
    browserSync = require('browser-sync').create('BrowserSync Frontend Boilerplate : ' + config.project_name),
    argv = require('minimist')(process.argv.slice(2)),
    log = require('./boilerplate-includes/core/lib/log'),
    javascript = require('./boilerplate-includes/core/lib/javascript'),
    configuration = require('./boilerplate-includes/core/lib/configuration'),
    Emittery = require('emittery'),
    tasks = require('./boilerplate-includes/core/lib/tasks.js'),
    program = require('commander');

var config_errors = configuration.check();
if (config_errors) {
    log.error({
        title: 'Error in configuration file.',
        msg: 'Please fix these issue(s) and then restart the Frontend Boilerplate.',
    });
    process.exit(0);
}

log.noticeDevProd();

config.generateJs.src_path = './boilerplate-includes/js/';
config.generateCss.src_path = './boilerplate-includes/scss/';
config.generateHtml.src = './boilerplate-includes/twig/';

if (config.extension_mode) {
    config.generateHtml.enable_index = false;
    config.generateHtml.browsersync.enable = false;
}

const emitter = new Emittery();
emitter.on('modernizr_precompiled', function () {
    if (argv._[0] === 'watch' || typeof argv._[0] === 'undefined') {
        if (config.generateJs.enable) {
            tasks.run(['javascript']);
        }
        if (config.generateCss.enable) {
            tasks.run(['css']);
        }
        if (config.generateHtml.enable) {
            tasks.run(['html']);
        }
        if (config.generateGitignore.enable) {
            tasks.run(['gitignore']);
        }
        if (config.extension_mode) {
            const extension = require('./boilerplate-includes/core/lib/extension');
            extension.generate();
        }
        if (!config.generateJs.enable && !config.generateCss.enable && !config.generateHtml.enable && !config.generateGitignore.enable && !config.extension_mode) {
            log.error('There\'s nothing to compile according to frontendboilerplate-configuration.js.');
            process.exit(0);
        }
    }
    program.command('html').option('--dev', 'Development mode').action(function () {
        if (config.generateHtml.enable) {
            tasks.run(['html']);
        } else {
            log.error('You must first enable html compilation in frontendboilerplate-configuration.js.');
            process.exit(0);
        }
    });
    program.command('gitignore').action(function () {
        if (config.generateGitignore.enable) {
            tasks.run(['gitignore']);
        } else {
            log.error('You must first enable gitignore generation in frontendboilerplate-configuration.js.');
            process.exit(0);
        }
    });
    program.command('css').option('--dev', 'Development mode').action(function () {
        if (config.generateCss.enable) {
            tasks.run(['css']);
        } else {
            log.error('You must first enable css generation in frontendboilerplate-configuration.js.');
            process.exit(0);
        }
    });
    program.command('check-scss').action(function () {
        if (config.generateCss.enable) {
            tasks.run(['check-scss']);
        } else {
            log.error('You must first enable css generation in frontendboilerplate-configuration.js.');
            process.exit(0);
        }
    });
    program.command('javascript').option('--dev', 'Development mode').action(function () {
        if (config.generateJs.enable) {
            tasks.run(['javascript']);
        } else {
            log.error('You must first enable javascript generation in frontendboilerplate-configuration.js.');
            process.exit(0);
        }
    });
    program.command('check-js').action(function () {
        if (config.generateJs.enable) {
            tasks.run(['check-js']);
        } else {
            log.error('You must first enable javascript generation in frontendboilerplate-configuration.js.');
            process.exit(0);
        }
    });
    program.command('clean').action(function () {
        tasks.run(['clean']);
    });
    program.command('imagemin').option('--lossless', 'No quality loss').action(function () {
        tasks.run(['imagemin']);
    });
    program.command('favicon').option('--skip-prompt', 'Skipp all prompts, minification will depend on --dev.').option('--dev', 'Skip minification when --skip-prompt is set.').action(function () {
        tasks.run(['favicon']);
    });
    program.command('watch').option('--dev', 'Development mode').option('--reload', 'Reload browser document').action(function () {
        const initWatch = require('./boilerplate-includes/core/lib/watch').init;
        initWatch();
    });
    program.option('--dev', 'Development mode').on('command:*', function () {
        log.error('Invalid command.');
        process.exit(0);
    });
    program.parse(process.argv);
});

global.modernizr_features_Global = [];

if (config.generateJs.enable) {
    if (argv._[0] === 'watch' || argv._[0] === 'javascript' || typeof argv._[0] === 'undefined') {
        if (javascript.modernizr.getTotalJsFilesThatWillIncludeModernizrCode() > 0) {
            log.info('Starting modernizr pre-compilation...');
            javascript.modernizr.generate(function () {
                emitter.emit('modernizr_precompiled');
                log.info('Finished modernizr pre-compilation.');
            });
        } else {
            emitter.emit('modernizr_precompiled');
        }
    } else {
        emitter.emit('modernizr_precompiled');
    }
} else {
    emitter.emit('modernizr_precompiled');
}