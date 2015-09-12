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
            "However before it there is another start block"
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

        // process passed 'blocks' options
        if (options.blocks && options.blocks.constructor === Object) {
            blocks = [options.blocks];
        } else if (Array.isArray(options.blocks)) {
            blocks = options.blocks;
        }

        // filter blocks
        blocks = blocks.filter(function (raw_blocks) {
            var isBlocksValid = typeof raw_blocks.start_block === 'string' &&
                raw_blocks.start_block && raw_blocks.end_block &&
                (raw_blocks.start_block !== raw_blocks.end_block);

            if (isBlocksValid === false) {
                grunt.log.warn('Skipped invalid pair of start/end block',
                    raw_blocks);
            }

            return isBlocksValid;
        });

        // process passed 'patterns' options
        if (Array.isArray(options.patterns)) {
            patterns = options.patterns;
        } else if (options.patterns instanceof RegExp) {
            patterns = [options.patterns];
        }

        // filter patterns
        patterns = patterns.filter(function (pattern) {
            var isPatternValid = pattern && pattern instanceof RegExp;

            if (isPatternValid === false) {
                grunt.log.warn('Skipped invalid pattern', pattern);
            }

            return isPatternValid;
        });

        // quit if we do not have nether blocks nor patterns
        if (blocks.length === 0 && patterns.length === 0) {
            grunt.warn('Do not find any kind of patterns');
        }

        // convert block pairs into regexps
        blocks = blocks.map(function (raw_blocks) {
            var regexpStr = [
                '[\\t ]*',
                escapeStringRegexp(raw_blocks.start_block),
                '[\\s\\S]*?',
                escapeStringRegexp(raw_blocks.end_block),
                '[\\t ]*',
                escapeStringRegexp(grunt.util.linefeed) + '?',
            ];

            return {
                block: new RegExp(regexpStr.join(''), 'g'),
                start: new RegExp(regexpStr[1]),
                end: new RegExp(regexpStr[3])
            };
        });

        // concat all regexps into single array
        regexps = [].concat(
            patterns, blocks.map(function (item) {
                return item.block;
            })
        );


        // function that prints error message and quits
        var generateMessage = function (params) {

            var message = strings[options.locale][error[params.caseNum - 1]]
                .replace('%n', (params.lineNum + 1).toString())
                .replace('%p', params.pattern.source)
                .replace('%f', currentFile);

            grunt.warn(message);
        };

        // function that is being called to check each line of the file
        // holds 3 subfunctions that does specific checks
        var checkLine = function (line, lineNum) {
            if (line.trim() === '') {
                return;
            }

            // function that checks if amount of start/end blocks
            // are equal.
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

            // function that checks if any two (or more) pairs of start/end
            // blocks are intersection.
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

            // if user needs parity check, do it
            if (options.parityCheck === true) {
                blocks.forEach(checkBlocksParity);
            }

            // if user needs check for intersection, do it
            if (options.intersectionCheck === true) {
                blocks.forEach(checkBlocksIntersection);
            }
        };

        // iterate over all specified file groups.
        this.files.forEach(function (f) {
            f.src.forEach(function (filepath) {
                var message = null;

                // warn on invalid source files
                if (grunt.file.exists(filepath) === false) {
                    message = 'Source file "' + filepath + '" not found.';
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
                    message = 'Stripped code from "' + filepath +
                        '" and saved to "' + destination + '"';
                } else {
                    message = 'Nothing has been stripped from "' +
                        filepath + '", saved to "' + destination + '"';
                }

                // print log message and write result to destination
                grunt.file.write(destination, replacement);
                grunt.log.writeln(message);
            });
        });
    });
};

