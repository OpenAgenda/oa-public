/*
 * tst.inherit.js: test that inheriting from VError and WError work as expected.
 */

const util = require('util');
const common = require('./common');

const VError = require('../lib/verror');
const WError = VError.WError;

test('inherits', () => {
  let err, suberr, stack, nodestack;

  class VErrorChild extends VError {
  }

  util.inherits(VErrorChild, VError);
  VErrorChild.prototype.name = 'VErrorChild';


  class WErrorChild extends WError {
  }

  util.inherits(WErrorChild, WError);
  WErrorChild.prototype.name = 'WErrorChild';

  /*
   * Save the generic parts of all stack traces so we can avoid hardcoding
   * Node-specific implementation details in our testing of stack traces.
   * The stack trace limit has to be large enough to capture all of Node's frames,
   * which are more than the default (10 frames) in Node v6.x.
   */
  Error.stackTraceLimit = 20;
  nodestack = new Error().stack.split('\n').slice(2).join('\n');

  suberr = new Error('root cause');
  err = new VErrorChild(suberr, 'top');
  expect(err instanceof Error).toBeTruthy();
  expect(err instanceof VError).toBeTruthy();
  expect(err instanceof VErrorChild).toBeTruthy();
  expect(VError.cause(err)).toEqual(suberr);
  expect(err.message).toEqual('top: root cause');
  expect(err.toString()).toEqual('VErrorChild: top: root cause');
  stack = common.cleanStack(err.stack);
  expect(stack).toEqual([
    'VErrorChild: top: root cause',
    '    at Object.<anonymous> (dummy filename)',
    nodestack
  ].join('\n'));

  suberr = new Error('root cause');
  err = new VErrorChild(suberr);
  expect(err instanceof Error).toBeTruthy();
  expect(err instanceof VError).toBeTruthy();
  expect(err instanceof VErrorChild).toBeTruthy();
  expect(VError.cause(err)).toEqual(suberr);
  expect(err.message).toEqual('root cause');
  expect(err.toString()).toEqual('VErrorChild: root cause');
  stack = common.cleanStack(err.stack);
  expect(stack).toEqual([
    'VErrorChild: root cause',
    '    at Object.<anonymous> (dummy filename)',
    nodestack
  ].join('\n'));

  suberr = new Error('root cause');
  err = new WErrorChild(suberr, 'top');
  expect(err instanceof Error).toBeTruthy();
  expect(err instanceof WError).toBeTruthy();
  expect(err instanceof WErrorChild).toBeTruthy();
  expect(VError.cause(err)).toEqual(suberr);
  expect(err.message).toEqual('top');
  expect(err.toString()).toEqual('WErrorChild: top; caused by Error: root cause');
  stack = common.cleanStack(err.stack);

  /*
   * On Node 0.10 and earlier, the 'stack' property appears to use the error's
   * toString() method.  On newer versions, it appears to use the message
   * property the first time err.stack is accessed (_not_ when it was
   * constructed).  Since the point of WError is to omit the cause messages from
   * the WError's message, there's no way to have the err.stack property show the
   * detailed message in Node 0.12 and later.
   */
  if (common.oldNode()) {
    expect(stack).toEqual([
      'WErrorChild: top; caused by Error: root cause',
      '    at Object.<anonymous> (dummy filename)',
      nodestack
    ].join('\n'));
  } else {
    expect(stack).toEqual([
      'WErrorChild: top',
      '    at Object.<anonymous> (dummy filename)',
      nodestack
    ].join('\n'));
  }

  /*
   * Test that "<Ctor>.toString()" uses the constructor name.
   */
  class VErrorChildNoName extends VError {
  }

  util.inherits(VErrorChildNoName, VError);
  err = new VErrorChildNoName('top');
  expect(err.toString()).toEqual('VErrorChildNoName: top');


  class WErrorChildNoName extends WError {
  }

  util.inherits(WErrorChildNoName, WError);
  err = new WErrorChildNoName('top');
  expect(err.toString()).toEqual('WErrorChildNoName: top');

  /*
   * Test that we get an appropriate exception name in toString() output.
   */
  err = new VError('top');
  err.name = 'CustomNameError';
  expect(err.toString()).toEqual('CustomNameError: top');

  err = new WError('top');
  err.name = 'CustomNameError';
  expect(err.toString()).toEqual('CustomNameError: top');
});
