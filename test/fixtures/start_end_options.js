var foo;

function baz() { }

/* {test} */
function bar() { }
/* {/test} */

/* test-code */
// call a func that does something
/* end-test-code */
function free(a, b, c /* {test} */ , d /* {/test} */) {
  // do something
}
