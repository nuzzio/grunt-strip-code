/*
 * grunt-strip-code
 * https://github.com/nuzzio/grunt-strip-code
 *
 * Copyright (c) 2015 Rene Cabral
 * Licensed under the MIT license.
 */

'use strict';

var escapeStringRegexp = require('escape-string-regexp');
var last = require('array-last');

module.exports = function (grunt) {
    var taskDescr = 'Strip code matching a specified pattern.';

    grunt.registerMultiTask('strip_code', taskDescr, function (target) {
        var blocks = [];
        var regexps = null;
        var patterns = [];
        var blockStats = [];
        var blocksStack = [];
        var currentFile = null;
        var strings = {};

        strings.en_us = {
            "missing.end.block": "Missing end block: in file `%f` at line %n for start block `%p`.",
            "missing.start.block": "Missing start block: in file `%f` at line %n for end block `%p`.",
            "extra.start.block": "Extra start block: In file `%f` at line %n end block `%p` is closed. " +
            "However before it there is another start block.",
            "skipped.invalid.pattern": "Skipped invalid pattern.",
            "skipped.invalid.blocks": "Skipped invalid pair of start/end blocks.",
            "no.blocks.or.patterns": "No blocks or patterns have been specified.",
            "source.file.not.found": "Source file `%1` not found.",
            "translate.param.missing": "translate() function must have at least a string key parameter.",
            "striped.file.saved.file": "Stripped code from file: `%1`, and saved it to: `%2`.",
            "nothing.striped.file.saved.file": "No code was stripped from file: `%1`,it was saved to: `%2`."
        };
        var errors = [];

        errors[1] = "missing.end.block";
        errors[2] = "missing.start.block";
        errors[3] = "extra.start.block";


        var options = this.options({
            intersectionCheck: false,
            parityCheck: false,
            locale: 'en_us',
            patterns: [],
            blocks: [{
                start_block: '/* test-code */',
                end_block: '/* end-test-code */'
            }]
        });

        /**
         * Process passed 'blocks' options.
         */
        if (options.blocks && options.blocks.constructor === Object) {
            blocks = [options.blocks];
        } else if (Array.isArray(options.blocks)) {
            blocks = options.blocks;
        }

        /**
         * Filter blocks.
         */
        blocks = blocks.filter(function (raw_blocks) {
            var isBlocksValid = typeof raw_blocks.start_block === 'string' &&
                raw_blocks.start_block && raw_blocks.end_block &&
                (raw_blocks.start_block !== raw_blocks.end_block);

            if (isBlocksValid === false) {
                grunt.log.warn(translate("skipped.invalid.blocks"),
                    raw_blocks);
            }

            return isBlocksValid;
        });

        /**
         * Process passed 'patterns' options.
         */
        if (Array.isArray(options.patterns)) {
            patterns = options.patterns;
        } else if (options.patterns instanceof RegExp) {
            patterns = [options.patterns];
        }

        /**
         * Filter patterns.
         */
        patterns = patterns.filter(function (pattern) {
            var isPatternValid = pattern && pattern instanceof RegExp;

            if (isPatternValid === false) {
                grunt.log.warn(translate("skipped.invalid.pattern"), pattern);
            }

            return isPatternValid;
        });

        /**
         * Quit if we have neither blocks nor patterns.
         */
        if (blocks.length === 0 && patterns.length === 0) {
            grunt.warn(translate("no.blocks.or.patterns"));
        }

        /**
         * Convert block pairs into Regex objects.
         */
        blocks = blocks.map(function (raw_blocks) {
            var regexpStr = [
                '[\\t ]*',
                escapeStringRegexp(raw_blocks.start_block),
                '[\\s\\S]*?',
                escapeStringRegexp(raw_blocks.end_block),
                '[\\t ]*',
                escapeStringRegexp(grunt.util.linefeed) + '?'
            ];

            return {
                block: new RegExp(regexpStr.join(''), 'g'),
                start: new RegExp(regexpStr[1]),
                end: new RegExp(regexpStr[3])
            };
        });

        /**
         * Concatenate all Regex objects into a single array.
         */
        regexps = [].concat(
            patterns, blocks.map(function (item) {
                return item.block;
            })
        );

        /**
         * Takes in dynamic parameters and expects first param to be a key for a string,
         * subsequent params will substitute the variables in the string
         * in the order they are declared.
         *
         * For the string: "my.key": "I will do my %1 then my %2"
         * translate('my.key', 'first replacement', 'second replacement')
         * the first replacement argument will replace %1, second %2 and so on.
         *
         * @param key string
         */
        var translate = function () {

            if(arguments.length === 0) {
                grunt.warn(strings[options.locale]['translate.param.missing']);
            }

            var key = arguments[0];

            var string = strings[options.locale][key];

            for(var i = 1; i < arguments.length; i++) {
                var replacementKey = '%'+i;
                string = string.replace(replacementKey, arguments[i]);
            }

            return string;
        };


        /**
         * Generates error messages for block and pattern errors then quits.
         */
        var generateMessage = function (params) {

            var message = translate(error[params.caseNum - 1])
                .replace('%n', (params.lineNum + 1).toString())
                .replace('%p', params.pattern.source)
                .replace('%f', currentFile);

            grunt.warn(message);
        };


        /**
         * Checks each line of the file.
         * Two (2) sub-functions check intersection and parity.
         * @param line
         * @param lineNum
         */
        var checkLine = function (line, lineNum) {
            if (line.trim() === '') {
                return;
            }

            /**
             * Checks that amount of start/end blocks are equal.
             *
             * @param blockDef
             * @param blockIdx
             */
            var checkBlocksParity = function (blockDef, blockIdx) {
                var block = blockStats[blockIdx];

                // 'if' for start block check
                if (blockDef.start.test(line) === true) {
                    if (block.startCount > block.endCount) {
                        generateMessage({
                            pattern: blockDef.start,
                            lineNum: block.lastStartLine,
                            caseNum: 1
                        });
                    }

                    block.lastStartLine = lineNum;
                    block.startCount++;
                }

                // 'if' for end block check
                if (blockDef.end.test(line) === true) {
                    if (block.endCount >= block.startCount) {
                        generateMessage({
                            pattern: blockDef.end,
                            lineNum: blockDef.lastEndLine,
                            caseNum: 2
                        });
                    }

                    block.lastEndLine = lineNum;
                    block.endCount++;
                }
            };


            /**
             * Checks if any two (or more) pairs of start/end
             * blocks are intersecting.
             *
             * @param blockDef
             * @param blockIdx
             */
            var checkBlocksIntersection = function (blockDef, blockIdx) {
                if (blockDef.start.test(line)) {
                    blocksStack.push([blockIdx, lineNum]);
                }

                if (blockDef.end.test(line)) {
                    if (last(blocksStack)[0] === blockIdx) {
                        blocksStack.pop();
                    } else {
                        generateMessage({
                            pattern: blockDef.start,
                            lineNum: last(blocksStack)[1],
                            caseNum: 3
                        });
                    }
                }
            };

            if (options.parityCheck === true) {
                blocks.forEach(checkBlocksParity);
            }

            if (options.intersectionCheck === true) {
                blocks.forEach(checkBlocksIntersection);
            }
        };

        /**
         * Iterate over all specified file groups.
         */
        this.files.forEach(function (f) {
            f.src.forEach(function (filepath) {
                var message = null;

                // warn on invalid source files
                if (grunt.file.exists(filepath) === false) {
                    message = translate("source.file.not.found", filepath);
                    grunt.log.warn(message);
                    return;
                }

                // get file content and its destination
                var contents = grunt.file.read(filepath);
                var destination = f.dest || filepath;
                var replacement = contents;
                currentFile = filepath;

                // create an structure that will hold stats while each file
                // is being checked
                blockStats = blocks.map(function () {
                    return {
                        startCount: 0,
                        endCount: 0,

                        lastStartLine: null,
                        lastEndLine: null
                    };
                });

                // check every line of the file with main 'check' function
                contents.split(grunt.util.linefeed).forEach(checkLine);

                // strip from file text that is matched (if so) to every regexp
                regexps.forEach(function (pattern) {
                    replacement = replacement.replace(pattern, '');
                });

                // compose summary message depending on strip results
                if (contents !== replacement) {
                    message = translate('striped.file.saved.file', filepath, destination);
                } else {
                    message = translate('nothing.striped.file.saved.file', filepath, destination);
                }

                // print log message and write result to destination
                grunt.file.write(destination, replacement);
                grunt.log.writeln(message);
            });
        });


    });
};

