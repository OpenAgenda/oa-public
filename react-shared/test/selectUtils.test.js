import {
  hasNewValues,
  appendNewValues,
} from '../src/components/lib/selectUtils.js';

describe('selectUtils', () => {
  describe('hasNewValues', () => {
    test('returns true when provided new values are not in existing', () => {
      expect(
        hasNewValues([{ label: 'One', value: 'One' }], 'One, Three', ','),
      ).toBe(true);
    });

    test('returns false when not', () => {
      expect(hasNewValues([{ label: 'One', value: 'One' }], 'One', ',')).toBe(
        false,
      );
    });

    describe('appendNewValues', () => {
      test('appends new values after split following provided separator', () => {
        expect(
          appendNewValues([{ label: 'One', value: 'One' }], 'Two, Three', ','),
        ).toEqual([
          {
            label: 'One',
            value: 'One',
          },
          {
            label: 'Two',
            value: 'Two',
          },
          {
            label: 'Three',
            value: 'Three',
          },
        ]);
      });
    });
  });
});
