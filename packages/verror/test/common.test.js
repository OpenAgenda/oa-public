'use strict';

/*
 * tst.common.js: tests functionality that's common to the VError and WError classes.
 */

const { VError, WError } = require('../lib/verror');
const common = require('./common');

/*
 * Save the generic parts of all stack traces so we can avoid hardcoding
 * Node-specific implementation details in our testing of stack traces.
 * The stack trace limit has to be large enough to capture all of Node's frames,
 * which are more than the default (10 frames) in Node v6.x.
 */


describe('common', () => {
  Error.stackTraceLimit = 20;
  let nodestack;

  /*
   * Runs all tests using the class "cons".  We'll apply this to each of the main
   * classes.
   */
  function runTests(Cons, label) {
    let err;
    let stack;
    let stackname;

    /*
     * On Node v0.10 and earlier, the name that's used in the "stack" output
     * is the constructor that was used for this object.  On Node v0.12 and
     * later, it's the value of the "name" property on the Error when it was
     * constructed.
     */
    if (common.oldNode()) {
      stackname = Cons.name;
    } else {
      stackname = label;
    }

    /* no arguments */
    err = new Cons();
    expect(err.name).toEqual(label);
    expect(err instanceof Error).toBeTruthy();
    expect(err instanceof Cons).toBeTruthy();
    expect(err.message).toEqual('');
    expect(VError.cause(err) === null).toBeTruthy();
    stack = common.cleanStack(err.stack);
    expect(stack).toEqual(`${[
      `${stackname}: `,
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    /* options-argument form */
    err = new Cons({});
    expect(err.name).toEqual(label);
    expect(err.message).toEqual('');
    expect(VError.cause(err) === null).toBeTruthy();

    /* simple message */
    err = new Cons('my error');
    expect(err.name).toEqual(label);
    expect(err.message).toEqual('my error');
    expect(VError.cause(err) === null).toBeTruthy();
    stack = common.cleanStack(err.stack);
    expect(stack).toEqual(`${[
      `${stackname}: my error`,
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    err = new Cons({}, 'my error');
    expect(err.name).toEqual(label);
    expect(err.message).toEqual('my error');
    expect(VError.cause(err) === null).toBeTruthy();

    /* fullStack */
    err = new Cons('Some error');
    stack = common.cleanStack(VError.fullStack(err));
    expect(stack).toEqual(`${[
      `${stackname}: Some error`,
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    err = new Error('Some error');
    stack = common.cleanStack(VError.fullStack(err));
    expect(stack).toEqual(`${[
      'Error: Some error',
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    /* printf-style message */
    err = new Cons('%s error: %3d problems', 'very bad', 15);
    expect(err.message).toEqual('very bad error:  15 problems');
    expect(VError.cause(err) === null).toBeTruthy();

    err = new Cons({}, '%s error: %3d problems', 'very bad', 15);
    expect(err.message).toEqual('very bad error:  15 problems');
    expect(VError.cause(err) === null).toBeTruthy();

    /* null cause (for backwards compatibility with older versions) */
    err = new Cons(null, 'my error');
    expect(err.message).toEqual('my error');
    expect(VError.cause(err) === null).toBeTruthy();
    stack = common.cleanStack(err.stack);
    expect(stack).toEqual(`${[
      `${stackname}: my error`,
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    err = new Cons({ cause: null }, 'my error');
    expect(err.message).toEqual('my error');
    expect(VError.cause(err) === null).toBeTruthy();

    err = new Cons(null);
    expect(err.message).toEqual('');
    expect(VError.cause(err) === null).toBeTruthy();
    stack = common.cleanStack(err.stack);
    expect(stack).toEqual(`${[
      `${stackname}: `,
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    /* constructorOpt */
    function makeErr(options) {
      return (new Cons(options, 'test error'));
    }

    err = makeErr({});
    stack = common.cleanStack(err.stack);
    expect(stack).toEqual(`${[
      `${stackname}: test error`,
      '    at makeErr (dummy filename)',
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    err = makeErr({ constructorOpt: makeErr });
    stack = common.cleanStack(err.stack);
    expect(stack).toEqual(`${[
      `${stackname}: test error`,
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);

    /* custom "name" */
    err = new Cons({ name: 'SomeOtherError' }, 'another kind of error');
    expect(err.name).toEqual('SomeOtherError');
    expect(err instanceof Cons).toBeTruthy();
    expect(err instanceof Error).toBeTruthy();
    expect(err.message).toEqual('another kind of error');
    stack = common.cleanStack(err.stack);
    expect(stack).toEqual(`${[
      'SomeOtherError: another kind of error',
      '    at runTests (dummy filename)',
      '    at Object.<anonymous> (dummy filename)'
    ].join('\n')}\n${nodestack}`);
  }

  test('VError', () => {
    nodestack = new Error().stack.split('\n').slice(2).join('\n');

    runTests(VError, 'VError');
  });

  test('WError', () => {
    nodestack = new Error().stack.split('\n').slice(2).join('\n');

    runTests(WError, 'WError');
  });
});
