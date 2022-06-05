# grunt-strip-code


The grunt-strip-code plugin is used to remove sections of code from production builds that are only needed in development and test environments. grunt-strip-code uses start and end comments to identify the code sections to strip out. For example:

```js
/* test-code */
removeMeInProduction();
/* end-test-code */

doNotRemoveMe();
```

A use-case for this practice is to make private JavaScript functions accessible to unit tests without exposing them in production builds. This [blog post](http://philipwalton.com/articles/how-to-unit-test-private-functions-in-javascript/) goes into more detail about the concept and implementation.

## Stats

Travis CI

| Branch  | CI  | Tests |
| :------------ |:--------------- | :--------------- |
| master        | [![Build Status](https://app.travis-ci.com/nuzzio/grunt-strip-code.svg?branch=master)](https://app.travis-ci.com/nuzzio/grunt-strip-code) | [![Coverage Status](https://coveralls.io/repos/github/nuzzio/grunt-strip-code/badge.svg?branch=master)](https://coveralls.io/github/nuzzio/grunt-strip-code?branch=master) |
| develop   | [![Build Status](https://app.travis-ci.com/nuzzio/grunt-strip-code.svg?branch=develop)](https://app.travis-ci.com/nuzzio/grunt-strip-code) | [![Coverage Status](https://coveralls.io/repos/github/nuzzio/grunt-strip-code/badge.svg?branch=develop)](https://coveralls.io/github/nuzzio/grunt-strip-code?branch=develop) |


AppVeyor

| Branch  | CI  |
| :------------ |:--------------- |
| master        | [![Build Status](https://ci.appveyor.com/api/projects/status/nko1optg81v0kew2/branch/master?svg=true)](https://ci.appveyor.com/project/nuzzio/grunt-strip-code) |
| develop   | [![Build Status](https://ci.appveyor.com/api/projects/status/nko1optg81v0kew2/branch/develop?svg=true)](https://ci.appveyor.com/project/nuzzio/grunt-strip-code) |




## Getting Started
This plugin requires Grunt `>=0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-strip-code --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-strip-code');
```

## The "strip_code" task

### Overview
In your project's Gruntfile, add a section named `strip_code` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  strip_code: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options


#### options.blocks
Type: `Array`
Default value:

```js
blocks: [
    {
        start_block: "/* test-code */",
        end_block: "/* end-test-code */"
    }
]
```
The `blocks` array contains one or more objects which define the boundaries of the text blocks to be deleted.

#### options.blocks.start_block
Type: `String`
Default value: `/* test-code */`

The text of the opening comment used to identify code to strip.

#### options.blocks.end_block
Type: `String`
Default value: `/* end-test-code */`

The text of the closing comment used to identify code to strip.

#### options.patterns
Type: `array`
Default value: `[]`

You can also supply your own RegExps to match against.

#### options.parityCheck
Type: `boolean`
Default value: `false`

Turns on check that makes sure if you blocks have same amount of start/end pairs in your code.

#### options.intersectionCheck
Type: `boolean`
Default value: `false`

Turns on check that makes sure if you blocks does not intersect between each other.

#### options.eol
Type: `String`
Choices: `'lf'`, `'cr'`, `'crlf'`
Default value: `''`

Unless one of the choices is explicitly specified, end-of-line defaults to the operating system specific character(s).

### Usage Examples

The following source code exposes the `bar` function to the public API for testing, but the `bar` function should not be accessible in the released library. grunt-strip-code (with the default options) will remove the comment blocks from the example below keeping the `bar` function private in production:

```js
(function() {

  function bar() {
    doSomething();
  }

  var api = {
    foo: function() {
      bar();
      return "foo";
    }
  }

  /* test-code */
  api._bar = bar;
  /* end-test-code */

  return api;
}());
```


#### Specifying different start and end comment values
The following configuration will strip out code that begins with the `/* start-test-block */` comment and ends with the `/* end-test-block */` comment, and code that begins with the `<!-- start-html-test-code -->` comment and ends with the `<!-- end-html-test-code -->` comment from all `.js` files in the `dist/` folder.

```js
grunt.initConfig({
  strip_code: {
    options: {
      blocks: [
        {
          start_block: "/* start-test-block */",
          end_block: "/* end-test-block */"
        },
        {
          start_block: "<!-- start-html-test-code -->",
          end_block: "<!-- end-html-test-code -->"
        }
      ]
    },
    your_target: {
        src: 'dist/*.js'
    }
  },
})
```

#### Using your own patterns

The following configuration will remove `log()` statements from all `.js` files in the `dist/` folder

```js
grunt.initConfig({
  strip_code: {
    options: {
      patterns: /log\(\)/g
    },
    your_target: {
        src: 'dist/*.js'
    }
  },
})
```

The `patterns` property can also take arrays of RegExp objects.

```js
grunt.initConfig({
  strip_code: {
    options: {
      patterns: [/log\(\)/g, / *console\.log\([\w\S ]+\);?\n?/g]
    },
    your_target: {
        src: 'dist/*.js'
    }
  },
})
```




#### Specifying source and destination.

The normal behavior is to strip out code in the source files and then save those files with the same name. If you need to save them to a different name, you can specify a `dest` option as well.

```js
grunt.initConfig({
  strip_code: {
    options: { },
    your_target: {
      files: [
        {src: 'tmp/my-app.js', dest: 'dist/my-app.js'},
        {src: 'tmp/my-lib.js', dest: 'dist/my-lib.js'}
      ]
    }
  },
})
```


#### Specifying Multiple `strip_code` Tasks.

```js
grunt.initConfig({
  strip_code: {
    strip_html_and_js_: {
      options: {
        blocks: [{
          start_block: "/* start-test-block */",
          end_block: "/* end-test-block */"
        }, {
          start_block: "<!-- start-html-test-code -->",
          end_block: "<!-- end-html-test-code -->"
        }]
      },
      src: 'src/*.html'

    },
    strip_php: {
      options: {
        blocks: [{
          start_block: "/* start-test-block */",
          end_block: "/* end-test-block */"
        }]
      },
      src: ['src/file1.php', 'src/file2.php']
    },
    strip_log_: {
      options: {
        patterns: /log\(\)/g
      },
      files: [{
        src: 'src/src-test.js',
        dest: 'dest/src-test.js'
      }, {
        src: 'src/src-test2.js',
        dest: 'dest/src-test2.js'
      }]

    }
  },
})
```


### Backward Compatibility with Version 0.1.2


#### Specifying different start and end comment values
The following configuration will strip out code that begins with the `/* start-test-block */` comment and ends with the `/* end-test-block */` comment from all `.js` files in the `dist/` folder.

```js
grunt.initConfig({
  strip_code: {
    options: {
      start_comment: 'start-test-block',
      end_comment: 'end-test-block',
    },
    your_target: {
        src: 'dist/*.js'
    }
  },
})
```

#### Using your own pattern

Note: if legacy `pattern` is declared, it will supercede legacy `start_comment` and `end_comment`.

The following configuration will remove `log()` statements from all `.js` files in the `dist/` folder

```js
grunt.initConfig({
  strip_code: {
    options: {
      pattern: /log\(\)/g
    },
    your_target: {
        src: 'dist/*.js'
    }
  },
})
```



## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

#### 1.0.12

* Updated grunt and ejs dependencies.

#### 1.0.10 - 1.0.11

* Updated security dev dependencies.
* Updated travis-ci badges
* Updated Read Me


#### 1.0.9

* Fixed Coveralls dependency error for test coverage report
* Updated Read Me

#### 1.0.8

* Write to disk only if the file contents were changed, or if the file destination is different from the source.
* Updated Read Me

#### 1.0.7

* Upgraded to travis-ci.com
* Log only number of changed files, you have to use grunt verbose (`--verbose`, `-v`) to get verbose logs.

#### 1.0.6

* Added Windows tests on AppVeyor.
* Removed custom line endings.


#### 1.0.5

Custom line endings contributed.

#### 1.0.4

Added Coveralls.

#### 1.0.1 - 1.0.3

Documentation changes.

#### 1.0.0

* Added `options.blocks` to take arrays of different start and end capture blocks.
* Added flag for intersectionCheck.
* Added flag for parityCheck.
* Major updates to package.json.
* Added Travis CI
* Added backward compatibility.

#### 0.1.2

* Minor updates to package.json.

#### 0.1.1

* Fix a bug so it only overwrites a file is there was stripped code.

#### 0.1.0

* Initial Release

