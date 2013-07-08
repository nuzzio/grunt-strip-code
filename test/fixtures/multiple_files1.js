(function() {

  var foo;

  /* test-code */
  function one() { }
  /* end-test-code */

  return {
    bar: "bar"
    /* test-code */ , one: "one" /* end-test-code */
  };
}());