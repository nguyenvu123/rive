/*
 * @file
 *
 * Builds custom .gitignore according to boilerplate-includes/frontendboilerplate-configuration.js.
 *
 */

const gitignore = require('../gitignore');

module.exports = function (done) {
    var success = gitignore.generate(true);
    done(success);
};