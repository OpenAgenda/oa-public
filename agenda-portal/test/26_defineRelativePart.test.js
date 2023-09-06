'use strict';

const defineRelativePart = require('../client/lib/defineRelativePart');

describe('26 - defineRelativePart', () => {
  test('hash values are loaded in relative part when set', () => {
    const relative = defineRelativePart(
      {},
      '/events/english-surf-camp-6251855?nc=eyJpbmRleCI6MSwidG90YWwiOjQ5NzV9',
    );

    expect(relative).toBe(
      '/events/english-surf-camp-6251855?nc=eyJpbmRleCI6MSwidG90YWwiOjQ5NzV9',
    );
  });

  test('data-count attribute defines limit if data-random-from-set is not set', () => {
    const relative = defineRelativePart({
      count: '3',
    });

    expect(relative).toBe('?limit=3');
  });

  test('data-count defines subsetRandom and data-random-from-set limit if both are set', () => {
    const relative = defineRelativePart({
      count: '3',
      randomFromSet: '20',
    });

    expect(relative).toBe('?subsetRandom=3&limit=20');
  });

  test('data-lang adds lang to relative part', () => {
    const relative = defineRelativePart({
      lang: 'de',
    });

    expect(relative).toBe('?lang=de');
  });
});
