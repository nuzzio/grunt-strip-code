var foo

/* test-code */
function baz() { }

/* {test} */
function bar() { }
/* {/test} */

// call a func that does something
/* end-test-code */
function(a, b, c /* {test} */ , d /* {/test} */) {
  // do something
}
