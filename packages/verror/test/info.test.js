/*
 * tst.info.js: tests the way informational properties are inherited with nested
 * errors.
 */

const verror = require('../lib/verror');

const VError = verror.VError;

test('info', () => {
  let err1, err2, err3;

  /* base case using "options" to specify cause */
  err1 = new Error('bad');
  err2 = new VError({
    'cause': err1
  }, 'worse');
  expect(VError.cause(err2)).toEqual(err1);
  expect(err2.message).toEqual('worse: bad');
  expect(VError.info(err2)).toEqual({});

  /* simple info usage */
  err1 = new VError({
    'name': 'MyError',
    'info': {
      'errno': 'EDEADLK',
      'anobject': { 'hello': 'world' }
    }
  }, 'bad');
  expect(err1.name).toEqual('MyError');
  expect(VError.info(err1)).toEqual({
    'errno': 'EDEADLK',
    'anobject': { 'hello': 'world' }
  });

  /* simple property propagation using old syntax */
  err2 = new VError(err1, 'worse');
  expect(VError.cause(err2)).toEqual(err1);
  expect(err2.message).toEqual('worse: bad');
  expect(VError.info(err2)).toEqual({
    'errno': 'EDEADLK',
    'anobject': { 'hello': 'world' }
  });

  /* one property override */
  err2 = new VError({
    'cause': err1,
    'info': {
      'anobject': { 'hello': 'moon' }
    }
  }, 'worse');
  expect(VError.cause(err2)).toEqual(err1);
  expect(err2.message).toEqual('worse: bad');
  expect(VError.info(err2)).toEqual({
    'errno': 'EDEADLK',
    'anobject': { 'hello': 'moon' }
  });

  /* add a third-level to the chain */
  err3 = new VError({
    'cause': err2,
    'name': 'BigError',
    'info': {
      'remote_ip': '127.0.0.1'
    }
  }, 'what next');
  expect(err3.name).toEqual('BigError');
  expect(VError.info(err3).remote_ip).toEqual('127.0.0.1');
  expect(VError.cause(err3)).toEqual(err2);
  expect(err3.message).toEqual('what next: worse: bad');
  expect(VError.info(err3).errno).toEqual('EDEADLK');
  expect(VError.info(err3).anobject).toEqual({ 'hello': 'moon' });
});
