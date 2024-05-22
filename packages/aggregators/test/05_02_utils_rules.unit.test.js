'use strict';

const text = require('../utils/rules/text');

describe('05_02 - utils - rules unit tests', () => {
  describe('text', () => {
    test('targetted field may not be defined in evaluated data', () => {
      expect(
        text(
          {
            other_place: 'Plan-les-Ouates',
          },
          {},
        ),
      ).toBe(false);
    });
  });
});
