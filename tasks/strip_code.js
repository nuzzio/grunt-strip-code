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
    var taskDescription = 'Strip code matching a specified pattern.';

    grunt.registerMultiTask('strip_code', taskDescription, function (target) {
        var blocks = [];
        var regexps = null;
        var patterns = [];
        var blockStats = [];
        var blocksStack = [];
        var currentFile = null;
        var fileStartDelimiters = [];
        var fileEndDelimiters = [];
        var strings = {};
        var strippedCount = 0;

        strings.en_us = {
            "missing.end.block": "Missing end block: in file `%f` for start block `%p` at line %n.",
            "missing.start.block": "Missing start block: in file `%f` for end block `%p` at line %n.",
            "extra.start.block": "Extra start block: `%x` in file `%f` at line %n, before required end block:" +
            " `%p` at line `%y`.",
            "skipped.invalid.pattern": "Skipped invalid pattern.",
            "skipped.invalid.blocks": "Skipped invalid pair of start/end blocks.",
            "no.blocks.or.patterns": "No blocks or patterns have been specified.",
            "source.file.not.found": "Source file `%1` not found.",
            "translate.param.missing": "translate() function must have at least a string key parameter.",
            "striped.file.saved.file": "Stripped code from file: `%1`, and saved it to: `%2`.",
            "nothing.striped.file.saved.file": "No code was stripped from file: `%1`,it was saved to: `%2`.",
            "string.key.missing": "String key not found",
            "stripped.summary": "Stripped %1 files."
        };

        var errors = [];

        errors[1] = "missing.end.block";
        errors[2] = "missing.start.block";
        errors[3] = "extra.start.block";

        var options = this.options({
            testMode: false,
            intersectionCheck: true,
            parityCheck: true,
            locale: 'en_us',
            patterns: [],
            blocks: [{
                start_block: '/* test-code */',
                end_block: '/* end-test-code */'
            }],
            //Legacy
            start_comment: false,
            end_comment: false,
            pattern: false,
            eol: ''
        });

        //
        // Set end of line
        //
        var endOfLine = grunt.util.linefeed;


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

            if (arguments.length === 0) {
                grunt.warn(strings[options.locale]['translate.param.missing']);
            }

            var key = arguments[0];

            if (!(key in strings[options.locale])) {
                grunt.warn(strings[options.locale]['string.key.missing'] + ': ' + key);
            }

            var string = strings[options.locale][key];

            for (var i = 1; i < arguments.length; i++) {
                var replacementKey = '%' + i;
                string = string.replace(replacementKey, arguments[i]);
            }

            return string;
        };

        // Legacy Checks
        // Respecting legacy code by taking pattern, if defined,
        // over start_comment & end_comment
        // ----------------------------------------------------------
        if (options.pattern !== false) {
            options.patterns.push(options.pattern);
        } else if (options.start_comment !== false && options.end_comment !== false) {
            var tmpObject = {};
            tmpObject.start_block = '/* ' + options.start_comment + ' */';
            tmpObject.end_block = '/* ' + options.end_comment + ' */';
            options.blocks.push(tmpObject);
        }
        // ----------------------------------------------------------

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
                '(' + endOfLine + ')?'
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
         * Generates error messages for block and pattern errors then quits.
         */
        var generateMessage = function (params) {

            var message = translate(errors[params.caseNum])
                .replace('%n', (params.lineNum + 1).toString())
                .replace('%p', params.pattern)
                .replace('%x', params.start)
                .replace('%y', (params.endLineNum + 1).toString())
                .replace('%f', currentFile);
            if (options.testMode === true) {
                grunt.log.writeln(message);
            } else {
                grunt.warn(message);
            }
        };


        /**
         * Checks each line of the file.
         * Sub-functions check intersection and parity.
         * @param line
         * @param lineNum
         */
        var checkLine = function (line, lineNum) {
            if (line.trim() === '') {
                return;
            }


            function logAnyDelimiterType(line) {
                blocks.forEach(function (blockDef, blockIdx) {
                    if (blockDef.start.test(line) === true) {
                        fileStartDelimiters.push([blockIdx, lineNum, line.trim()]);
                    }
                    if (blockDef.end.test(line) === true) {
                        fileEndDelimiters.push([blockIdx, lineNum, line.trim()]);
                    }
                });
            }

            logAnyDelimiterType(line);


            var startCount = fileStartDelimiters.length;
            var endCount = fileEndDelimiters.length;

            /**
             * Checks that amount of start/end blocks are equal.
             *
             * @param blockDef
             * @param blockIdx
             */
            var checkBlocksParity = function (blockDef, blockIdx) {
                var block = blockStats[blockIdx];

                /**
                 * 'if' for start block check
                 */
                if (blockDef.start.test(line) === true) {

                    block.lastStartLine = lineNum;

                    if (block.startCount > block.endCount) {
                        generateMessage({
                            pattern: line.trim(),
                            lineNum: block.lastStartLine,
                            caseNum: 1
                        });
                    }

                    block.startCount++;
                }


                /**
                 * 'if' for end block check
                 */
                if (blockDef.end.test(line) === true) {

                    block.lastEndLine = lineNum;

                    if (block.endCount >= block.startCount) {
                        generateMessage({
                            pattern: line.trim(),
                            lineNum: block.lastEndLine,
                            caseNum: 2
                        });
                    }

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
                    blocksStack.push([blockIdx, lineNum, line.trim()]);
                }

                if (blockDef.end.test(line) && typeof last(blocksStack) !== "undefined") {
                    if (last(blocksStack)[0] === blockIdx) {
                        blocksStack.pop();
                    } else {
                        generateMessage({
                            start: last(blocksStack)[2],
                            pattern: line.trim(),
                            lineNum: last(blocksStack)[1],
                            endLineNum: lineNum,
                            caseNum: 3
                        });
                    }
                } else if (startCount - endCount > 1) {
                    generateMessage({
                        start: last(blocksStack)[2],
                        pattern: line.trim(),
                        lineNum: last(blocksStack)[1],
                        endLineNum: lineNum,
                        caseNum: 3
                    });
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
                var isFileStripped = false;
                fileStartDelimiters = [];
                fileEndDelimiters = [];

                if (grunt.file.exists(filepath) === false) {
                    message = translate("source.file.not.found", filepath);
                    grunt.log.warn(message);
                    return;
                }

                var contents = grunt.file.read(filepath);
                var destination = f.dest || filepath;
                var replacement = contents;
                currentFile = filepath;


                /**
                 * Creates a structure that will hold the properties of each file
                 * while it is being checked.
                 */
                blockStats = blocks.map(function () {
                    return {
                        startCount: 0,
                        endCount: 0,
                        lastStartLine: 0,
                        lastEndLine: 0
                    };
                });

                /**
                 * Process every line of the current file with main 'check' function
                 */
                contents.split(endOfLine).forEach(checkLine);

                /**
                 * Strip block match from file
                 */
                regexps.forEach(function (pattern) {
                    replacement = replacement.replace(pattern, '');
                });

                if (contents !== replacement) {
                    message = translate('striped.file.saved.file', filepath, destination);
                    isFileStripped = true;
                    strippedCount++;
                } else {
                    message = translate('nothing.striped.file.saved.file', filepath, destination);
                }

                /**
                 * Write file to its destination.
                 */
                if (isFileStripped || filepath !== destination) {
                    grunt.file.write(destination, replacement);
                }

                /**
                 * Log file strip status and write destination.
                 */
                grunt.verbose.writeln(message);
            });
        });

        grunt.log.writeln(translate('stripped.summary', strippedCount));
        grunt.verbose.writeln('');
    });
};
