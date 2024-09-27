import { produce } from 'immer';

import validate from '../src/validate';

import settingsFixtures from './fixtures/settings.json';
import locationFixtures from './fixtures/location.json';

describe('validate', () => {
  describe('siret', () => {
    test('displaySIRETInput option includes siret validation', () => {
      const clean = validate(
        produce(locationFixtures, (draft) => {
          draft.siret = '12345678901234';
        }),
        settingsFixtures,
        {
          optional: true,
          displaySIRETInput: true,
        },
      );

      expect(clean.siret).toBe('12345678901234');
    });

    test('siret is optional', () => {
      const clean = validate(locationFixtures, settingsFixtures, {
        optional: true,
        displaySIRETInput: true,
      });

      expect(clean.siret).toBeNull();
    });

    test('siret must be 14 characters long', () => {
      let errors = [];
      try {
        validate(
          produce(locationFixtures, (draft) => {
            draft.siret = '12345678901';
          }),
          settingsFixtures,
          {
            optional: true,
            displaySIRETInput: true,
          },
        );
      } catch (e) {
        errors = e;
      }
      expect(errors).toEqual([
        {
          origin: '12345678901',
          code: 'string.tooshort',
          message: 'the string is too short',
          field: 'siret',
          values: { min: 14, max: 14 },
        },
      ]);
    });
  });
});
