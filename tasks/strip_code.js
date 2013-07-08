/*
 * grunt-strip-code
 * https://github.com/philip/grunt-strip-code
 *
 * Copyright (c) 2013 Philip Walton
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask("strip_code", "Strip code matching a specified patterna.", function(target) {

    var options = this.options({
          startComment: "test-code",
          endComment: "end-test-code"
        })
      , pattern = options.pattern || new RegExp(
            "[\\t ]*\\/\\* ?"
          + options.startComment
          + " ?\\*\\/[\\s\\S]*?\\/\\* ?"
          + options.endComment
          + " ?\\*\\/[\\t ]*\\n?"
          , "g"
        );
    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      f.src.forEach(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return;
        }
        // strip test blocks from the file
        var contents = grunt.file.read(filepath).replace(pattern, "");
        // save file and print a success message.
        if (f.dest) {
          grunt.file.write(f.dest, contents);
          grunt.log.writeln("Stripped code from " + filepath + " and saved to " + f.dest);
        } else {
          grunt.file.write(filepath, contents);
          grunt.log.writeln("Stripped code from " + filepath);
        }
      });
    });
  });
};