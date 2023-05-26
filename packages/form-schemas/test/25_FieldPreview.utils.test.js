'use strict';

const fpUtils = require('../client/src/FormSchemaBuilder/FieldPreview/utils');

const {
  isAccessUndefined,
} = fpUtils;

describe('FieldPreview utils', () => {
  describe('isAccessUndefined', () => {
    test('read access is defined', () => {
      expect(
        isAccessUndefined({
          read: ['administrator'],
        }),
      ).toBe(false);
    });

    test('write access is defined', () => {
      expect(
        isAccessUndefined({
          write: ['administrator'],
        }),
      ).toBe(false);
    });

    test('write is null and read is undefined gives true', () => {
      expect(
        isAccessUndefined({
          read: undefined,
          write: null,
        }),
      ).toBe(true);
    });

    test('read is null and write is undefined gives true', () => {
      expect(
        isAccessUndefined({
          write: undefined,
          read: null,
        }),
      ).toBe(true);
    });
  });
});
