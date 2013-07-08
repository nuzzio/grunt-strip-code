/*
 * grunt-strip-code
 * https://github.com/philip/grunt-strip-code
 *
 * Copyright (c) 2013 Philip Walton
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: 'tmp',
    },

    // Before running strip_code, copy the files to the tmp directory
    copy: {
      tests: {
        files: [
          {expand:true, cwd:'test/fixtures/', src: '*', dest: 'tmp/'}
        ]
      },
    },

    // Configuration to be run (and then tested).
    strip_code: {
      default_options: {
        src: 'tmp/default_options.js',
      },
      start_end_options: {
        options: {
          start_comment: '{test}',
          end_comment: '{/test}',
        },
        src: 'tmp/start_end_options.js',
      },
      pattern_options: {
        options: {
          pattern: / *console\.log\(['"a-z]+\)\n?/g
        },
        src: 'tmp/pattern_options.js',
      },
      dest_specified: {
        files: [
          {src: 'tmp/dest_specified.js', dest: 'tmp/dest_specified2.js'},
        ]
      },
      multiple_files: {
        src: ['tmp/multiple_files*.js', 'tmp/another_multiple_file.js']
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'copy', 'strip_code', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
