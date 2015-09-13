(function() {

  var foo;

  /* test-code */
  function bar() { }
  /* end-test-code */

  var test;

  // <debug>
  function test() {}
  // </debug>

  return {
    bar: "bar"
    /* test-code */ , fizz: "buzz" /* end-test-code */
,   html    :"	<debug> "
            +"	test"
            +"	</debug>"
	//<debug>
,	debug	:"debug"
	//</debug>
  };
}());
