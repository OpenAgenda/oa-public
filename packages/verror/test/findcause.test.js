/*
 * tst.findcause.js: tests findCauseByName()/hasCauseWithName()/findCauseByType()/hasCauseWithType().
 */

const util = require('util');
const verror = require('../lib/verror');

const VError = verror.VError;
const WError = verror.WError;

const findCauseByName = VError.findCauseByName;
const hasCauseWithName = VError.hasCauseWithName;
const findCauseByType = VError.findCauseByType;
const hasCauseWithType = VError.hasCauseWithType;

/*
 * This class deliberately doesn't inherit from our error classes.
 */
function MyError() {
  Error.call(this, 'here is my error');
}

util.inherits(MyError, Error);
MyError.prototype.name = 'MyError';


/*
 * We'll build up a cause chain using each of our classes and make sure
 * that findCauseByName() traverses all the way to the bottom.  This
 * ends up testing that findCauseByName() works with each of these
 * classes.
 */

test('find cause', () => {
  let err1, err2, err3;

  err1 = new MyError();
  err2 = new VError({
    'name': 'ErrorTwo',
    'cause': err1
  }, 'basic verror (number two)');
  err3 = new WError({
    'name': 'ErrorThree',
    'cause': err2
  }, 'werror (number Three)');

  /*
   * By contrast, the next-level errors should have only their own causes.
   */
  expect(null).toBe(findCauseByName(err3, 'ErrorFour'));
  expect(false).toBe(hasCauseWithName(err3, 'ErrorFour'));
  expect(err3).toBe(findCauseByName(err3, 'ErrorThree'));
  expect(true).toBe(hasCauseWithName(err3, 'ErrorThree'));
  expect(err2).toBe(findCauseByName(err3, 'ErrorTwo'));
  expect(true).toBe(hasCauseWithName(err3, 'ErrorTwo'));
  expect(err1).toBe(findCauseByName(err3, 'MyError'));
  expect(true).toBe(hasCauseWithName(err3, 'MyError'));
  expect(err1).toBe(findCauseByType(err3, MyError));
  expect(true).toBe(hasCauseWithType(err3, MyError));

  expect(null).toBe(findCauseByName(err2, 'ErrorFour'));
  expect(false).toBe(hasCauseWithName(err2, 'ErrorFour'));
  expect(null).toBe(findCauseByName(err2, 'ErrorThree'));
  expect(false).toBe(hasCauseWithName(err2, 'ErrorThree'));
  expect(err2).toBe(findCauseByName(err2, 'ErrorTwo'));
  expect(true).toBe(hasCauseWithName(err2, 'ErrorTwo'));
  expect(err1).toBe(findCauseByName(err2, 'MyError'));
  expect(true).toBe(hasCauseWithName(err2, 'MyError'));
  expect(err1).toBe(findCauseByType(err2, MyError));
  expect(true).toBe(hasCauseWithType(err2, MyError));

  /*
   * These functions must work on non-VError errors.
   */
  expect(null).toBe(findCauseByName(err1, 'ErrorTwo'));
  expect(false).toBe(hasCauseWithName(err1, 'ErrorTwo'));
  expect(err1).toBe(findCauseByName(err1, 'MyError'));
  expect(true).toBe(hasCauseWithName(err1, 'MyError'));
  expect(err1).toBe(findCauseByType(err1, MyError));
  expect(true).toBe(hasCauseWithType(err1, MyError));

  err1 = new Error('a very basic error');
  expect(err1).toBe(findCauseByName(err1, 'Error'));
  expect(true).toBe(hasCauseWithName(err1, 'Error'));
  expect(null).toBe(findCauseByName(err1, 'MyError'));
  expect(false).toBe(hasCauseWithName(err1, 'MyError'));
  expect(err1).toBe(findCauseByType(err1, Error));
  expect(true).toBe(hasCauseWithType(err1, Error));

  /*
   * These functions should throw an Error when given bad argument types.
   */
  expect(function () {
    findCauseByName(null, 'AnError');
  }).toThrow();
  expect(function () {
    hasCauseWithName(null, 'AnError');
  }).toThrow();
  expect(function () {
    findCauseByName(err1, null);
  }).toThrow();
  expect(function () {
    hasCauseWithName(err1, null);
  }).toThrow();
  expect(function () {
    findCauseByType(null, 'AnError');
  }).toThrow();
  expect(function () {
    hasCauseWithType(null, 'AnError');
  }).toThrow();
  expect(function () {
    findCauseByType(err1, null);
  }).toThrow();
  expect(function () {
    hasCauseWithType(err1, null);
  }).toThrow();
});
