/**
 * grunt-strip-code
 * https://github.com/nuzzio/grunt-strip-code
 *
 * Copyright (c) 2015 Rene Cabral
 * Licensed under the MIT license.
 * Date: 9/13/15
 */

'use strict';

exports.helper =  {

    grunt: require('grunt'),
    tmpDir: 'test/tmp/',
    expectedDir: 'test/expected/',
    gruntReader: function (file) {
        return this.grunt.file.read(file);
    },
    expectedReader: function (file) {
        return this.gruntReader(this.expectedDir + file);
    },
    tmpReader: function (file) {
        return this.gruntReader(this.tmpDir + file);
    }

};