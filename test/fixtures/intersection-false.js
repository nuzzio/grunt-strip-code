(function() {

  var foo;

  /* test-code */
  function two() { }

  /* {test} */
  /* end-test-code */

  return {
    bar: "bar"
    , two: "two" /* {/test} */
  };
}());