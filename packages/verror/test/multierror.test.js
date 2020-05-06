/*
 * tst.multierror.js: tests MultiError class
 */

const VError = require('../lib/verror');
const common = require('./common');

const MultiError = VError.MultiError;
const errorFromList = VError.errorFromList;
const errorForEach = VError.errorForEach;

/*
 * Save the generic parts of all stack traces so we can avoid hardcoding
 * Node-specific implementation details in our testing of stack traces.
 * The stack trace limit has to be large enough to capture all of Node's frames,
 * which are more than the default (10 frames) in Node v6.x.
 */
test('MultiError', () => {
  Error.stackTraceLimit = 20;
  const nodestack = new Error().stack.split('\n').slice(2).join('\n');

  let err1, err2, err3, merr, stack;
  let accum, doAccum;

  expect(function () {
    console.error(new MultiError());
  }).toThrow();

  expect(function () {
    console.error(new MultiError([]));
  }).toThrow();

  err1 = new Error('error one');
  err2 = new Error('error two');
  err3 = new Error('error three');
  merr = new MultiError([err1, err2, err3]);
  expect(VError.cause(merr)).toEqual(err1);
  expect(merr.message).toEqual('first of 3 errors: error one');
  expect(merr.name).toEqual('MultiError');
  stack = common.cleanStack(merr.stack);
  expect(stack).toBe([
    'MultiError: first of 3 errors: error one',
    '    at Object.<anonymous> (dummy filename)'
  ].join('\n') + '\n' + nodestack);

  merr = new MultiError([err1]);
  expect(merr.message).toEqual('first of 1 error: error one');
  expect(merr.name).toEqual('MultiError');
  stack = common.cleanStack(merr.stack);
  expect(stack).toEqual([
    'MultiError: first of 1 error: error one',
    '    at Object.<anonymous> (dummy filename)'
  ].join('\n') + '\n' + nodestack);


  /* errorFromList */
  expect(function () {
    console.error(errorFromList());
  }).toThrow();

  expect(function () {
    console.error(errorFromList(null));
  }).toThrow();

  expect(function () {
    console.error(errorFromList({}));
  }).toThrow();

  expect(function () {
    console.error(errorFromList('asdf'));
  }).toThrow();

  expect(function () {
    console.error(errorFromList([new Error(), 17]));
  }).toThrow();

  expect(function () {
    console.error(errorFromList([new Error(), {}]));
  }).toThrow();

  expect(null).toBe(errorFromList([]));
  expect(err1 === errorFromList([err1])).toBeTruthy();
  expect(err2 === errorFromList([err2])).toBeTruthy();
  merr = errorFromList([err1, err2, err3]);
  expect(merr instanceof MultiError).toBeTruthy();
  expect(merr.errors()[0] === err1).toBeTruthy();
  expect(merr.errors()[1] === err2).toBeTruthy();
  expect(merr.errors()[2] === err3).toBeTruthy();


  /* errorForEach */
  expect(function () {
    console.error(errorForEach());
  }).toThrow();

  expect(function () {
    console.error(errorForEach(null));
  }).toThrow();

  expect(function () {
    console.error(errorForEach(err1));
  }).toThrow();

  expect(function () {
    console.error(errorForEach(err1, {}));
  }).toThrow();

  expect(function () {
    console.error(errorForEach({}, function () {
    }));
  }).toThrow();

  accum = [];
  doAccum = function (e) {
    accum.push(e);
  };

  accum = [];
  errorForEach(err1, doAccum);
  expect(accum.length).toEqual(1);
  expect(accum[0] === err1).toBeTruthy();

  accum = [];
  errorForEach(merr, doAccum);
  expect(accum.length).toEqual(3);
  expect(accum[0] === err1).toBeTruthy();
  expect(accum[1] === err2).toBeTruthy();
  expect(accum[2] === err3).toBeTruthy();
});
