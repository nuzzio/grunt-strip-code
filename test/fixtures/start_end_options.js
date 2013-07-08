var foo

/* test-code */
function baz() { }
/* end-test-code */

/* {test} */
function bar() { }
/* {/test} */

function(a, b, c /*{test}*/ , d /*{/test}*/) {
  // do something
}