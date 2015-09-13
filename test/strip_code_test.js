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
    //default_options: function (test) {
    //    test.expect(1);
    //
    //    var actual = helper.grunt.file.read('default_options.js');
    //    var expected = helper.grunt.file.read('default_options.js');
    //    test.equal(actual, expected, 'should default to using "test-code" and "end-test-code" as the identifiers.');
    //
    //    test.done();
    //},
    start_end_options: function (test) {
        test.expect(1);

        var actual = helper.tmpReader('start_end_options.js');
        var expected = helper.expectedReader('start_end_options.js');
        test.equal(actual, expected, 'should use the specified start and end comment identifiers.');

        test.done();
    },
    pattern_options: function (test) {
        test.expect(1);

        var actual = helper.tmpReader('pattern_options.js');
        var expected = helper.expectedReader('pattern_options.js');
        test.equal(actual, expected, 'should ignore start and end identifiers and use the pattern option if present.');

        test.done();
    },
    dest_specified: function (test) {
        test.expect(1);

        var actual = helper.tmpReader('dest_specified2.js');
        var expected = helper.expectedReader('dest_specified.js');
        test.equal(actual, expected, 'should save to the dest option if specified.');

        test.done();
    },
    multiple_files: function (test) {
        test.expect(3);

        var actual1 = helper.tmpReader('multiple_files1.js');
        var expected1 = helper.expectedReader('multiple_files1.js');
        var actual2 = helper.tmpReader('multiple_files2.js');
        var expected2 = helper.expectedReader('multiple_files2.js');
        var actual3 = helper.tmpReader('another_multiple_file.js');
        var expected3 = helper.expectedReader('another_multiple_file.js');
        test.equal(actual1, expected1, 'should handle multiple files.');
        test.equal(actual2, expected2, 'should handle multiple files.');
        test.equal(actual3, expected3, 'should handle multiple files.');

        test.done();
    }
};
