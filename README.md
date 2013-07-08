# grunt-strip-code

The grunt-strip-code plugin is used to strip code from production builds that is only needed in development and test environments. grunt-strip-code uses start and end coments to identify the code sections to strip out.

A sample use case for dev or test only code is to expose hidden functions for unit testing without exposing them in production. [This article](http://philipwalton.com/articles/how-to-test-private-javascript-functions/) explains the concept and implementation.

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
Default value: `'.'`

The text inside the closing comment used to identify code to strip.

#### options.pattern
Type: `String`
Default value: (a generated RegExp matching the start and end comment)

If you want to strip code but don't want to wrap the code in start and end comments, you can supply your own RegExp to match. If `pattern` is specified, `start_comment` and `end_comment` are ignored.

### Usage Examples

#### Using custom start and end comments
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

#### Specifying `src` and `dest` files.

The normal behavior is to strip out code in the source files and then save those files with the same name. If you need to save them to a different name, you can specify a `dest` option as well.

```js
grunt.initConfig({
  strip_code: {
    options: { },
    files: [
      {src: 'dist/my-app-test.js', dest: 'my-app.js'},
      {src: 'dist/my-lib-test.js', dest: 'my-lib.js'},
    ],
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

=== 0.1.0

* First Release
