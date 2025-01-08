'use strict';

const { protectExtIdsFn } = require('../lib/formatExtIds');

describe('protectExtIdsFn', () => {
  it('test 1', () => {
    const out = protectExtIdsFn(
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
    const out = protectExtIdsFn(
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
