import { scrubDefaultValue } from '../client/src/iso/fieldOptions.js';

describe('fieldOptions', () => {
  describe('scrubDefaultValue', () => {
    const options = [
      { id: 1, value: 'a', label: { en: 'A' } },
      { id: 2, value: 'b', label: { en: 'B' } },
    ];

    test('passes null/undefined through untouched', () => {
      expect(scrubDefaultValue(null, options)).toBeNull();
      expect(scrubDefaultValue(undefined, options)).toBeUndefined();
    });

    test('keeps array tokens that resolve to an option id', () => {
      expect(scrubDefaultValue([1, 2], options)).toStrictEqual([1, 2]);
    });

    test('drops array tokens that resolve to no option', () => {
      expect(scrubDefaultValue([1, 99], options)).toStrictEqual([1]);
    });

    test('returns null when no array token resolves', () => {
      expect(scrubDefaultValue([98, 99], options)).toBeNull();
    });

    test('resolves not-yet-persisted options by value', () => {
      const unsaved = [{ value: 'a', label: { en: 'A' } }];
      expect(scrubDefaultValue(['a', 'gone'], unsaved)).toStrictEqual(['a']);
    });

    test('scalar default is kept when it resolves, nulled otherwise', () => {
      expect(scrubDefaultValue(1, options)).toBe(1);
      expect(scrubDefaultValue(99, options)).toBeNull();
    });

    test('treats missing options as resolving nothing', () => {
      expect(scrubDefaultValue([1], undefined)).toBeNull();
      expect(scrubDefaultValue(1, undefined)).toBeNull();
    });
  });
});
