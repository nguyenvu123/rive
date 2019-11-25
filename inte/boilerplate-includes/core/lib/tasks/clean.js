/*
 * @file
 *
 * Erases generated assets.
 *
 */

const clean = require('../clean');

module.exports = function (done) {
    clean.clean(function (success) {
        done(success);
    });
};