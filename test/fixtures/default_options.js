(function() {

  var foo;

  /* test-code */
  function bar() { }
  /* end-test-code */

  return {
    bar: "bar"
    /* test-code */ , fizz: "buzz" /* end-test-code */
  };
}());