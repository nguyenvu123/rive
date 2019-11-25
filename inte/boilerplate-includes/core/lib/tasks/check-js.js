/*
 * @file
 *
 * Checks JavaScript syntax.
 *
 */

const javascript = require('../javascript');

module.exports = function (done) {
    javascript.check(true, function (success) {
        done(success);
    });
};