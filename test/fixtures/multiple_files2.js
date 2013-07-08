(function() {

  var foo;

  /* test-code */
  function two() { }
  /* end-test-code */

  return {
    bar: "bar"
    /* test-code */ , two: "two" /* end-test-code */
  };
}());