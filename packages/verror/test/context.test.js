/*
 * tst.context.js: tests that cause works with errors from different contexts.
 */

const verror = require('../lib/verror');
const vm = require('vm');

const VError = verror.VError;

const prog1 = 'callback(new Error(), "Error")';
const prog2 = 'const e = new Error(); e.name = "BarError"; callback(e, "BarError")';

/*
 * We run the same set of tests using two different errors: one whose name is
 * the default "Error", and one whose name has been changed.
 *
 * Note that changing the name is not the same as having a constructor that
 * inherits from Error. Such Errors are not currently supported when
 * constructed in another context.
 */

describe('context', () => {
  function runTests(cerr, name) {
    let verr;

    /*
     * The constructor should recognize the other context's Error as an
     * error for wrapping, and not as an options object.
     */
    verr = new VError(cerr);
    expect(VError.cause(verr)).toEqual(cerr);

    verr = new VError({ cause: cerr });
    expect(VError.cause(verr)).toEqual(cerr);

    /*
     * The assertions done at each step while walking the cause chain
     * should be okay with the other context's Error.
     */
    expect(verror.findCauseByName(cerr, 'FooError')).toEqual(null);
    expect(verror.findCauseByName(verr, name)).toEqual(cerr);

    /*
     * Verify that functions that take an Error as an argument
     * accept the Error created in the other context.
     */
    expect(verror.cause(cerr)).toEqual(null);
    expect(verror.info(cerr)).toEqual({});
    expect(typeof (verror.fullStack(cerr))).toEqual('string');
  }

  const context = vm.createContext({
    'callback': runTests
  });

  test('prog 1', () => {
    vm.runInContext(prog1, context);
  });

  test('prog 2', () => {
    vm.runInContext(prog2, context);
  });
});
