# grunt-strip-code

The grunt-strip-code plugin is used to remove sections of code from production builds that are only needed in development and test environments. grunt-strip-code uses start and end comments to identify the code sections to strip out. For example:

```js
/* test-code */
removeMeInProduction();
/* end-test-code */

doNotRemoveMe();
```

A use-case for this practice is to make private JavaScript functions accessible to unit tests without exposing them in production builds. This [blog post](http://philipwalton.com/articles/how-to-unit-test-private-functions-in-javascript/) goes into more detail about the concept and implementation.

## Getting Started
This plugin requires Grunt `~0.4.1`

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

#### options.start_comment
Type: `String`
Default value: `test-code`

The text inside the opening comment used to identify code to strip.

#### options.end_comment
Type: `String`
Default value: `end-test-code`

The text inside the closing comment used to identify code to strip.

#### options.pattern
Type: `RegExp`
Default value: (a generated RegExp matching the start and end comments)

If the default start and end comment matching doesn't work for you needs, you can supply your own RegExp to match against. If the `pattern` option is specified, the `start_comment` and `end_comment` options are ignored.

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
The following configuration will strip out code that begins with the `/* start-test-block */` comment and ends with the `/* end-test-block */` comment from all `.js` files in the `dist/` folder.

```js
grunt.initConfig({
  strip_code: {
    options: {
      start_comment: 'start-test-block',
      end_comment: 'end-test-block',
    },
    src: 'dist/*.js'
  },
})
```

#### Using your own pattern

The following configuration will remove `log()` statements from all `.js` files in the `dist/` folder

```js
grunt.initConfig({
  strip_code: {
    options: {
      pattern: /log\(\)/g
    },
    src: 'dist/*.js'
  },
})
```

#### Specifying source and destination.

The normal behavior is to strip out code in the source files and then save those files with the same name. If you need to save them to a different name, you can specify a `dest` option as well.

```js
grunt.initConfig({
  strip_code: {
    options: { },
    files: [
      {src: 'tmp/my-app.js', dest: 'dist/my-app.js'},
      {src: 'tmp/my-lib.js', dest: 'dist/my-lib.js'},
    ],
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

#### 0.1.2

* Minor updates to package.json.

#### 0.1.1

* Fix a bug so it only overwrites a file is there was stripped code.

#### 0.1.0

* Initial Release
