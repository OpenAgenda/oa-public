'use strict';

const replaceAccents = require('../replaceAccents');

test('è with length of 2 become è with length of 1', () => {
  const src = 'è';
  expect(src.length).toBe(2);
  const result = replaceAccents('è');
  expect(result.length).toBe(1);
  expect(result).toBe('è');
});

test('Û with length of 2 become Û with length of 1', () => {
  const src = 'Û';
  expect(src.length).toBe(2);

  const result = replaceAccents(src);

  expect(result.length).toBe(1);
  expect(result).toBe('Û');
});

test('string with several characters with accents', () => {
  const src = 'À côté de l\'alcôve ovoïde';
  expect(src.length).toBe(30);

  const result = replaceAccents(src);

  expect(result.length).toBe(25);
  expect(result).toBe('À côté de l\'alcôve ovoïde');
});

test('handles strings in object of strings', () => {
  const src = {
    a: 'À côté',
    b: 'de l\'alcôve ovoïde',
    c: null
  };

  const result = replaceAccents(src);

  expect(result).toEqual({
    a: 'À côté',
    b: 'de l\'alcôve ovoïde',
    c: null
  });
});
