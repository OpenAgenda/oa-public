/*
 * tst.verror.js: tests functionality that's specific to the VError class.
 */

const verror = require('../lib/verror');
const common = require('./common');

const VError = verror.VError;
const WError = verror.WError;

/*
 * Save the generic parts of all stack traces so we can avoid hardcoding
 * Node-specific implementation details in our testing of stack traces.
 * The stack trace limit has to be large enough to capture all of Node's frames,
 * which are more than the default (10 frames) in Node v6.x.
 */
test('VError', () => {
  Error.stackTraceLimit = 20;
  const nodestack = new Error().stack.split('\n').slice(2).join('\n');

  let err, suberr, stack;

  /* "null" or "undefined" as string for sprintf-js */
  err = new VError('my %s string', null);
  expect('my null string').toEqual(err.message);
  err = new VError('my %s string', undefined);
  expect('my undefined string').toEqual(err.message);

  /* caused by another error, with no additional message */
  suberr = new Error('root cause');
  err = new VError(suberr);
  expect(err.message).toEqual('root cause');
  expect(VError.cause(err) === suberr).toBeTruthy();

  err = new VError({ 'cause': suberr });
  expect(err.message).toEqual('root cause');
  expect(VError.cause(err) === suberr).toBeTruthy();

  /* caused by another error, with annotation */
  err = new VError(suberr, 'proximate cause: %d issues', 3);
  expect(err.message).toEqual('proximate cause: 3 issues: root cause');
  expect(VError.cause(err) === suberr).toBeTruthy();
  stack = common.cleanStack(err.stack);
  expect(stack).toEqual([
    'VError: proximate cause: 3 issues: root cause',
    '    at Object.<anonymous> (dummy filename)'
  ].join('\n') + '\n' + nodestack);

  /* caused by another VError, with annotation. */
  suberr = err;
  err = new VError(suberr, 'top');
  expect(err.message).toEqual('top: proximate cause: 3 issues: root cause');
  expect(VError.cause(err) === suberr).toBeTruthy();

  err = new VError({ 'cause': suberr }, 'top');
  expect(err.message).toEqual('top: proximate cause: 3 issues: root cause');
  expect(VError.cause(err) === suberr).toBeTruthy();

  /* caused by a WError */
  suberr = new WError(new Error('root cause'), 'mid');
  err = new VError(suberr, 'top');
  expect(err.message).toEqual('top: mid');
  expect(VError.cause(err) === suberr).toBeTruthy();

  /* empty message */
  err = new VError(new VError(new VError(new VError('Test')), 'Ok'))
  expect(err.message).toEqual('Ok: Test');

  /* fullStack */
  suberr = new VError(new Error('root cause'), 'mid');
  err = new VError(suberr, 'top');
  stack = common.cleanStack(VError.fullStack(err));
  expect(stack).toEqual([
    'VError: top: mid: root cause',
    '    at Object.<anonymous> (dummy filename)'
  ].join('\n') + '\n' + nodestack + '\n' + [
    'caused by: VError: mid: root cause',
    '    at Object.<anonymous> (dummy filename)'
  ].join('\n') + '\n' + nodestack + '\n' + [
    'caused by: Error: root cause',
    '    at Object.<anonymous> (dummy filename)'
  ].join('\n') + '\n' + nodestack);
});
