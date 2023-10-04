import spreadRegistrationValuesByService from '../src/utils/spreadRegistrationValuesByService';
import mergeSpreadRegistrationValues from '../src/utils/mergeSpreadRegistrationValues';

describe('utils', () => {
  describe('spreadRegistrationValuesByService', () => {
    test('extracts types from provided values when needed', () => {
      expect(
        spreadRegistrationValuesByService([
          'https://openagenda.com',
          'email@domain.com',
        ]),
      ).toEqual({
        standard: [
          { type: 'link', value: 'https://openagenda.com' },
          { type: 'email', value: 'email@domain.com' },
        ],
        passCulture: null,
      });
    });

    test('passCulture item is placed in its own key', () => {
      expect(
        spreadRegistrationValuesByService([{
          type: 'link',
          value: 'https://pass.culture.fr/offers/1234',
          service: 'passCulture',
          data: { stuff: 'test' },
        }]),
      ).toEqual({
        standard: [],
        passCulture: { stuff: 'test' },
      });
    });

    test('invalid value is given "error" type', () => {
      expect(
        spreadRegistrationValuesByService(['schmilblick']),
      ).toEqual({
        standard: [{
          type: 'error',
          value: 'schmilblick',
        }],
        passCulture: null,
      });
    });
  });

  describe('mergeSpreadRegistrationValues', () => {
    test('merges passCulture value with other values in single array', () => {
      expect(
        mergeSpreadRegistrationValues({
          standard: [{
            type: 'email',
            value: 'name@domain.com',
          }],
          passCulture: {
            someParam: 'bisounours',
          },
        }),
      ).toEqual([{
        type: 'email',
        value: 'name@domain.com',
      }, {
        type: 'link',
        value: null,
        service: 'passCulture',
        data: {
          someParam: 'bisounours',
        },
      }]);
    });
  });
});
