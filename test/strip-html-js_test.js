/**
 * grunt-strip-code
 * https://github.com/nuzzio/grunt-strip-code
 *
 * Copyright (c) 2015 Rene Cabral
 * Licensed under the MIT license.
 * Date: 9/13/15
 */

var helper = require('./helper.js').helper;

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */


exports.strip_html_code = {
    setUp: function (done) {
        // setup here if necessary
        done();
    },
    default_options: function (test) {
        test.expect(1);
        var file = 'default_options.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should default to using "test-code" and "end-test-code" as the identifiers.'
        );

        test.done();
    }
};
