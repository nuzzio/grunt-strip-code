/**
 * grunt-strip-code
 * https://github.com/nuzzio/grunt-strip-code
 *
 * Copyright (c) 2015 Rene Cabral
 * Licensed under the MIT license.
 * Date: 9/13/15
 */

'use strict';

var helper = require('./helper.js').helper;
var os = require('os');

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

exports.strip_code = {
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
            'should default to using "/* test-code */" and "/* end-test-code */" as the block delimeters.'
        );

        test.done();
    },
    strip_html_and_js_code: function (test) {
        test.expect(1);
        var file = 'sample.html';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should strip HTML debug code and JS debug code using specified blocks array'
        );

        test.done();
    },
    start_end_options: function (test) {
        test.expect(1);

        var file = 'start_end_options.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should use the specified start and end block delimiters.'
        );

        test.done();
    },
    patterns_options: function (test) {
        test.expect(1);

        var file = 'patterns_options.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should use the patterns option if present.'
        );

        test.done();
    },
    dest_specified: function (test) {
        test.expect(1);

        var file = 'dest_specified2.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader('dest_specified.js');
        test.equal(
            actual,
            expected,
            'should save to the dest option if specified.'
        );

        test.done();
    },
    multiple_files: function (test) {
        test.expect(3);

        var file1 = 'multiple_files1.js';
        var file2 = 'multiple_files2.js';
        var file3 = 'another_multiple_file.js';
        var actual1 = helper.tmpReader(file1);
        var expected1 = helper.expectedReader(file1);
        var actual2 = helper.tmpReader(file2);
        var expected2 = helper.expectedReader(file2);
        var actual3 = helper.tmpReader(file3);
        var expected3 = helper.expectedReader(file3);
        test.equal(
            actual1,
            expected1,
            'should handle multiple files.'
        );
        test.equal(
            actual2,
            expected2,
            'should handle multiple files.'
        );
        test.equal(
            actual3,
            expected3,
            'should handle multiple files.'
        );

        test.done();
    },
    intersection_false: function (test) {
        test.expect(1);

        var file = 'intersection-false.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should fail to clean file properly.'
        );

        test.done();
    },
    parity_false: function (test) {
        test.expect(1);

        var file = 'parity-false.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should fail to clean file properly.'
        );

        test.done();
    },
    legacy_pattern: function (test) {
        test.expect(1);

        var file = 'legacy_pattern.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should use the legacy pattern option.'
        );

        test.done();
    },
    legacy_pattern_start_end: function (test) {
        test.expect(1);

        var file = 'legacy_pattern_start_end.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should ignore start and end legacy comments and use the legacy pattern option if present.'
        );

        test.done();
    },
    legacy_start_end: function (test) {
        test.expect(1);

        var file = 'legacy_start_end.js';
        var actual = helper.tmpReader(file);
        var expected = helper.expectedReader(file);
        test.equal(
            actual,
            expected,
            'should strip the code between the legacy start and end comments.'
        );

        test.done();
    }
};
