import {
  getDefaultValueLabel,
  isAccessUndefined,
} from '../client/src/FormSchemaBuilder/FieldPreview/utils.js';

describe('FieldPreview utils', () => {
  describe('getDefaultValueLabel', () => {
    test('checkbox default maps option ids to their labels', () => {
      const field = {
        fieldType: 'checkbox',
        default: ['a', 'b'],
        options: [
          { id: 'a', label: { fr: 'Option A' } },
          { id: 'b', label: { fr: 'Option B' } },
        ],
      };

      expect(getDefaultValueLabel(field, 'fr')).toBe('Option A, Option B');
    });

    test('checkbox default with an orphan option id does not throw', () => {
      const field = {
        fieldType: 'checkbox',
        default: ['a', 'gone'],
        options: [{ id: 'a', label: { fr: 'Option A' } }],
      };

      expect(() => getDefaultValueLabel(field, 'fr')).not.toThrow();
      expect(getDefaultValueLabel(field, 'fr')).toBe('Option A, gone');
    });

    test('single-value default with a missing option falls back to the raw value', () => {
      const field = {
        default: 'gone',
        options: [{ id: 'a', label: { fr: 'Option A' } }],
      };

      expect(() => getDefaultValueLabel(field, 'fr')).not.toThrow();
      expect(getDefaultValueLabel(field, 'fr')).toBe('gone');
    });
  });

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
