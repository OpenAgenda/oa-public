import { produce } from 'immer';

import validate from '../src/validate.js';

import settingsFixtures from './fixtures/settings.json' with { type: 'json' };
import locationFixtures from './fixtures/location.json' with { type: 'json' };

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

      expect(clean.siret).toBeUndefined();
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
          code: 'tooshort',
          message: 'value is too short',
          field: 'siret',
        },
      ]);
    });
  });
});
