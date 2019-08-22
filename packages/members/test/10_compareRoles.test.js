'use strict';

const {
  isSuperiorTo,
  isSuperiorToOrEqual,
  isEqualTo,
  isLessThan
} = require('../').utils.compareRoles;

describe('members - utils - compareRoles', () => {
  describe('isSuperiorTo', () => {
    test('works with roles as integers', () => {
      const administrator = 2;
      const moderator = 3;

      expect(isSuperiorTo(administrator, moderator)).toBe(true);
    });

    test('works with roles as smallcase strings', () => {
      expect(isSuperiorTo('administrator', 'moderator')).toBe(true);
    });

    test('works with mixed', () => {
      expect(isSuperiorTo('administrator', 3)).toBe(true);
      expect(isSuperiorTo(3, 'administrator')).toBe(false);
    });

    test('works with roles as uppercase strings', () => {
      expect(isSuperiorTo('ADMINISTRATOR', 'MODERATOR')).toBe(true);
    });

    test('administrator is superior to moderator', () => {
      expect(isSuperiorTo('administrator', 'moderator')).toBe(true);
    });

    test('moderator is not superior to administrator', () => {
      expect(isSuperiorTo('moderator', 'administrator')).toBe(false);
    });

    test('moderator is not superior to moderator', () => {
      expect(isSuperiorTo('moderator', 'moderator')).toBe(false);
    });

    test('undefined or null is not superior to reader', () => {
      expect(isSuperiorTo(undefined, 'reader')).toBe(false);
    });

    test('Unknown error is thrown if given string is unknown', () => {
      let error;

      try {
        isSuperiorTo('ADMINISTRATOR', 'CLOWN');
      } catch (e) {
        error = e;
      }

      expect(error.message).toBe('Unknown role: CLOWN');
    });
  });

  describe('isLessThan', () => {
    test('moderator is less than administrator', () => {
      expect(isLessThan('moderator', 'administrator')).toBe(true);
    });

    test('moderator is not less than reader', () => {
      expect(isLessThan('moderator', 'reader')).toBe(false);
    });

    test('null is less than reader', () => {
      expect(isLessThan(null, 'reader')).toBe(true);
    });
  });

  describe('isSuperiorToOrEqual', () => {
    test('moderator is superior or equal to moderator', () => {
      expect(isSuperiorToOrEqual('moderator', 'moderator')).toBe(true);
    });

    test('moderator is not superior to or equal to administrator', () => {
      expect(isSuperiorToOrEqual('moderator', 'administrator')).toBe(false);
    });
  });

  describe('isEqualTo', () => {
    test('contributor is equal to contributor', () => {
      expect(isEqualTo('contributor', 'contributor')).toBe(true);
    });

    test('contributor is not equal to reader', () => {
      expect(isEqualTo('contributor', 'reader')).toBe(false);
    });
  });
});
