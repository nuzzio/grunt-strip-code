/*
 * grunt-strip-code
 * https://github.com/philip/grunt-strip-code
 *
 * Copyright (c) 2013 Philip Walton
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    //http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
    RegExp.escape = function (s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    grunt.registerMultiTask("strip_code", "Strip code matching a specified pattern.", function (target) {


            var options = this.options({
                    blocks: [
                        {
                            start_block: "/* test-code */",
                            end_block: "/* end-test-code */"
                        }
                    ]
                })
                ;
            var patterns = [];
            //make patterns
            options.blocks.forEach(function (raw_blocks) {
                raw_blocks.start_block = RegExp.escape(raw_blocks.start_block);
                raw_blocks.end_block = RegExp.escape(raw_blocks.end_block);

                patterns.push(new RegExp(
                    "[\\t ]*"
                        + raw_blocks.start_block
                        + "[\\s\\S]*?"
                        + raw_blocks.end_block
                        + "[\\t ]*\\n?"
                    , "g"
                ));

            });

            // Iterate over all specified file groups.
            this.files.forEach(function (f) {
                // Concat specified files.
                f.src.forEach(function (filepath) {
                    // Warn on and remove invalid source files (if nonull was set).
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return;
                    }
                    var contents = grunt.file.read(filepath);
                    var replacement = contents;
                    patterns.forEach(function (pattern) {
                        replacement = replacement.replace(pattern, "");
                    });
                    // if replacement is different than contents, save file and print a success message.
                    if (contents !== replacement) {
                        if (f.dest) {
                            grunt.file.write(f.dest, replacement);
                            grunt.log.writeln("Stripped code from " + filepath + " and saved to " + f.dest);
                        } else {
                            grunt.file.write(filepath, replacement);
                            grunt.log.writeln("Stripped code from " + filepath);
                        }
                    }
                });
            });
        }
    )
    ;
}
;