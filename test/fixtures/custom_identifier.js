var foo

/* test-code */
function baz() { }
/* end-test-code */

/* {test} */
function bar() { }
/* {/test} */

// debug_start
function foobar() { }
// debug_end

function(a, b, c /*{test}*/ , d /*{/test}*/) {
  // do something
}