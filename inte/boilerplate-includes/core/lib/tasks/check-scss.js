/*
 * @file
 *
 * Checks SCSS syntax.
 *
 */

const css = require('../css');

module.exports = function (done) {
    css.check(true, function (success) {
        done(success);
    });
};