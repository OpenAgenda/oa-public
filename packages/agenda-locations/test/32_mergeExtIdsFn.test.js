'use strict';

const { mergeExtIdsFn } = require('../lib/formatExtIds');

describe('mergeExtIdsFn', () => {
  it('test 1', () => {
    const out = mergeExtIdsFn(
      { extIds: [{ key: 'default', value: 'arg' }] },
      {
        extIds: [
          { key: 'default', value: 'arg1' },
          { key: 'test', value: '2SDq' },
        ],
      },
    );
    expect(out).toStrictEqual([
      { key: 'default', value: 'arg' },
      { key: 'test', value: '2SDq' },
    ]);
  });

  it('test 2', () => {
    const out = mergeExtIdsFn(
      {
        extIds: [
          { key: 'default', value: 'arg' },
          { key: 'test', value: '2SDq' },
        ],
      },
      { extIds: [{ key: 'default', value: 'arg1' }] },
    );
    expect(out).toStrictEqual([
      { key: 'default', value: 'arg' },
      { key: 'test', value: '2SDq' },
    ]);
  });
});
