'use strict';

const { getRoleSlug, getRoleCode } = require('..').utils;

describe('members - functional - utils', () => {
  describe('getRoleSlug', () => {
    test('provides slug corresponding to given code', () => {
      expect(getRoleSlug(2)).toBe('administrator');
    });

    test('throws error if code is not known', () => {
      let error;

      try {
        getRoleSlug(42);
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe('Unknown role');
    });

    test('if role slug is provided, role slug is given back as result', () => {
      expect(getRoleSlug('administrator')).toBe('administrator');
    });
  });

  describe('getRoleCode', () => {
    test('provides code corresponding to given slug', () => {
      expect(getRoleCode('administrator')).toBe(2);
    });

    test('throws error if slug is not known', () => {
      let error;

      try {
        getRoleCode('spoon');
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe('Unknown role');
    });
  });
});
