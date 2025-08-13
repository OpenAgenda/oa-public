import {
  validateDate,
  validatePriceCategory,
  validateLocalData,
} from '../iso/validate/index.js';
import { findLastVenueIdFromData } from '../iso/utils.js';

import settings from './fixtures/settings.json';
import dataWithPendingOffer from './fixtures/data.withPendingOffer.pc.json';
import dataWithDependedOffer from './fixtures/data.withDependedOffer.pc.json';
import partiallySpread from './fixtures/partiallySpread.json';

describe('validate', () => {
  describe('validateDate', () => {
    test('undefined is not a date', () => {
      let error;
      try {
        validateDate(undefined, {
          priceCategories: [],
          timings: [],
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.object');
    });

    test('a boolean is returned in boolMode', () => {
      const isValid = validateDate(undefined, {
        priceCategories: [],
        timings: [],
        boolMode: true,
      });

      expect(isValid).toBe(false);
    });

    test('priceCategoryIndex must point to an existing priceCategory', () => {
      let error;

      try {
        validateDate(
          { priceCategoryId: 1 },
          { priceCategories: [], ignoreId: true },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.priceCategoryId');
    });

    test('quantity must be an integer equal to or superior to 0', () => {
      let error;

      try {
        validateDate(
          { priceCategoryId: 0, quantity: 'bim' },
          {
            priceCategories: [{ a: 'notvalidatedheresowhatever', id: 0 }],
            ignoreId: true,
          },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.quantity');
    });

    test('timingId must match a defined timing', () => {
      let error;

      try {
        validateDate(
          { priceCategoryId: 0, quantity: 1, timingId: 123 },
          {
            priceCategories: [{ a: 'wigglypoof', id: 0 }],
            timings: [],
            ignoreId: true,
          },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.timingId');
    });

    test('returns clean date object when input is valid', () => {
      const clean = validateDate(
        {
          id: 12,
          priceCategoryId: 0,
          quantity: '1',
          timingId: 1920532380000,
        },
        {
          priceCategories: [{ a: 'tottorototttoroo', id: 0 }],
          timings: [
            {
              begin: {
                date: '2030-11-10',
                hours: 10,
                minutes: 13,
              },
            },
          ],
          ignoreId: true,
        },
      );

      expect(clean).toEqual({
        id: 12,
        priceCategoryId: 0,
        quantity: 1,
        timingId: 1920532380000,
      });
    });
  });

  describe('validatePriceCategory', () => {
    test('price must be a positive number', () => {
      let error;

      try {
        validatePriceCategory({
          price: '🛀',
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.price');
    });

    test('boolMode returns boolean indicating validity instead of throwing error', () => {
      const isValid = validatePriceCategory(
        {
          price: '🤷',
        },
        { boolMode: true },
      );

      expect(isValid).toBe(false);
    });

    test('label should be a non-empty string', () => {
      let error;

      try {
        validatePriceCategory({
          price: 0,
          label: '',
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.string');
    });

    test('returns a clean priceCategory when valid', () => {
      const clean = validatePriceCategory({
        price: '4.2',
        label: 'Prix universel',
      });

      expect(clean).toEqual({
        price: 4.2,
        label: 'Prix universel',
      });
    });
  });

  describe('validateLocalData', () => {
    describe('as merged object', () => {
      const validData = {
        venueId: 123,
        priceCategories: [{ price: '0', label: 'Gratuit', id: 0 }],
        dates: [
          {
            id: 1,
            priceCategoryId: 0,
            quantity: '1',
            timingId: 1920532380000,
          },
        ],
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        bookingContact: 'kelly@slater.com',
      };

      const matchingTimings = [
        {
          begin: {
            date: '2030-11-10',
            hours: 10,
            minutes: 13,
          },
        },
      ];

      test('a category must be defined', () => {
        let error;

        try {
          validateLocalData(
            {
              ...validData,
              category: undefined,
            },
            { timings: matchingTimings },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors[0].code).toBe(
          'registration.pass.requiredCategory',
        );
      });

      test('a valid category must be defined', () => {
        let error;

        try {
          validateLocalData(
            {
              ...validData,
              category: 'WALL_STARING',
            },
            { timings: matchingTimings },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors[0].code).toBe(
          'registration.pass.unknownCategory',
        );
      });

      test('if a category not requiring a subcategory is set, subcategory is not read', () => {
        const clean = validateLocalData(
          {
            ...validData,
            category: 'CINE_PLEIN_AIR',
            subcategory: 'AIR_MARIN',
          },
          { timings: matchingTimings },
          settings,
        );

        expect(clean.category).toBe('CINE_PLEIN_AIR');

        expect(clean.subcategory).toBeUndefined();
      });

      test('if category is CONCERT', () => {
        const clean = validateLocalData(
          {
            ...validData,
            category: 'CONCERT',
          },
          { timings: matchingTimings },
          settings,
        );
        expect(clean.category).toBe('CONCERT');
      });

      test('if a category requiring a subType is set, musicType/showType must be set', () => {
        let error;

        try {
          validateLocalData(
            {
              ...validData,
              category: 'CONCERT',
              musicType: undefined,
            },
            { timings: matchingTimings },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors[0].code).toBe(
          'registration.pass.musicType.required',
        );
      });

      test('if a category requiring a subType is set, subType must be valid', () => {
        let error;

        try {
          validateLocalData(
            {
              ...validData,
              category: 'CONCERT',
              musicType: 'ZIKMU',
            },
            { timings: matchingTimings },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors[0].code).toBe(
          'registration.pass.musicType.invalid',
        );
      });

      test('valid subType is included in clean data', () => {
        const { musicType } = validateLocalData(
          {
            ...validData,
            category: 'CONCERT',
            musicType: 'JAZZ-ACID_JAZZ',
          },
          { timings: matchingTimings },
          settings,
        );

        expect(musicType).toBe('JAZZ-ACID_JAZZ');
      });

      test('at least one price category must be defined', () => {
        let error;

        try {
          validateLocalData({}, { timings: [] }, settings);
        } catch (e) {
          error = e;
        }

        expect(error.info.errors.map((e) => e.code)).toContain(
          'registration.pass.requiredPriceCategories',
        );
      });

      test('venueId is required', () => {
        let error;

        try {
          validateLocalData(
            {
              ...validData,
              venueId: undefined,
            },
            { timings: matchingTimings },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors.map(({ code }) => code)).toContain(
          'registration.pass.invalidVenueId',
        );
      });

      test('at least one date should be defined', () => {
        let error;

        try {
          validateLocalData(
            {
              priceCategories: [{ price: 2, label: 'Prix tapadeubal' }],
            },
            { timings: [] },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors.map((e) => e.code)).toContain(
          'registration.pass.requiredDates',
        );
      });

      test('invalid bookingContact throws an error', () => {
        let error;

        try {
          validateLocalData(
            {
              ...validData,
              bookingContact: 'notanemail',
            },
            { timings: [] },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors.map((e) => e.code)).toContain(
          'registration.pass.bookingContact.invalid',
        );
      });

      test('valid bookingContact does not throw an error', () => {
        let error;

        try {
          validateLocalData(
            {
              ...validData,
              bookingContact: 'a@valid.email',
            },
            { timings: [] },
            settings,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors.map((e) => e.code)).not.toContain(
          'registration.pass.bookingContact.invalid',
        );
      });

      test('boolMode returns false when data is not valid', () => {
        const isValid = validateLocalData(
          {
            priceCategories: [{ price: 2, label: 'Prix tapadeubal' }],
            dates: [],
          },
          {
            timings: [],
          },
          { ...settings, boolMode: true },
        );

        expect(isValid).toBe(false);
      });

      test('returns clean data when input is valid', () => {
        const clean = validateLocalData(
          validData,
          { timings: matchingTimings },
          settings,
        );

        expect(clean).toEqual({
          bookingContact: 'kelly@slater.com',
          bookingEmail: undefined,
          category: 'CONCERT',
          musicType: 'JAZZ-BEBOP',
          priceCategories: [{ price: 0, label: 'Gratuit', id: 0 }],
          dates: [
            {
              id: 1,
              priceCategoryId: 0,
              quantity: 1,
              timingId: 1920532380000,
            },
          ],
          venueId: 123,
        });
      });
    });

    describe('as list of changes', () => {
      test('validating a list is equivalent from validating a merge object at each step', () => {
        const clean = validateLocalData(
          dataWithPendingOffer,
          {
            timings: [
              {
                begin: '2034-09-06T08:00:00.000Z',
                end: '2034-09-06T10:00:00.000Z',
              },
            ],
          },
          settings,
        );

        expect(clean).toEqual([
          {
            duo: true,
            category: 'CONCERT',
            musicType: 'JAZZ-BEBOP',
            venueId: 548,
            bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
            appliedAt: '2024-05-29T10:00:00.OOOZ',
            response: {
              isPending: true,
              passId: 123456,
            },
          },
          {
            priceCategories: [
              {
                price: 20,
                label: 'trezterztrez',
                id: 0,
              },
              {
                price: 30,
                label: 'static',
                id: 1,
              },
            ],
          },
          {
            dates: [
              {
                priceCategoryId: 0,
                quantity: 456,
                timingId: 2041142400000,
                id: 2,
              },
            ],
          },
        ]);
      });

      test('appliedAt, response and operation keys are not filtered out if isolated in their own item', () => {
        const clean = validateLocalData(
          dataWithDependedOffer,
          {
            timings: [
              {
                begin: '2024-09-06T08:00:00.000Z',
                end: '2024-09-06T10:00:00.000Z',
              },
            ],
          },
          settings,
        );

        expect(Object.keys(clean[1])).toEqual([
          'operation',
          'appliedAt',
          'response',
        ]);
      });

      test('last item is spread when provided as a bundle', () => {
        const clean = validateLocalData(
          partiallySpread,
          {
            timings: [
              {
                begin: '2024-06-14T08:00:00.000Z',
              },
            ],
          },
          settings,
        );

        expect(clean[3]).toEqual({
          eventDuration: 220,
        });

        expect(clean[4]).toEqual({
          priceCategories: [
            {
              price: 30,
              label: 'Tarif pas si unique',
              id: 2,
            },
          ],
        });

        expect(clean[5]).toEqual({
          dates: [
            {
              id: 3,
              timingId: 1718352000000,
              priceCategoryId: 2,
              quantity: 2,
            },
          ],
        });
      });

      test('validation errors are relevant', () => {
        let errors;
        try {
          validateLocalData(
            [
              {
                category: 'CONCERT',
                musicType: 'JAZZ-BEBOP',
                priceCategories: [{ price: 0, label: 'Gratuit', id: 0 }],
                dates: [
                  {
                    id: 1,
                    priceCategoryId: 0,
                    quantity: 1,
                    timingId: 1920532380000,
                  },
                ],
                venueId: 123,
              },
            ],
            {
              timings: [
                {
                  begin: new Date(1920532380000),
                },
              ],
            },
            settings,
          );
        } catch (e) {
          errors = e.info.errors;
        }

        expect(errors).toEqual([
          {
            message: 'email is invalid',
            code: 'registration.pass.bookingContact.invalid',
            label: "L'email est invalide",
            field: 'bookingContact',
            fieldLabel: 'Pass Culture',
          },
        ]);
      });

      test('noise data is filtered out', () => {
        const clean = validateLocalData(
          [
            {
              category: 'CONCERT',
              musicType: 'JAZZ-BEBOP',
              priceCategories: [{ price: 0, label: 'Gratuit', id: 0 }],
              bookingContact: 'email@website.com',
              dates: [
                {
                  id: 1,
                  priceCategoryId: 0,
                  quantity: 1,
                  timingId: 1920532380000,
                },
              ],
              venueId: 123,
            },
            {
              editing: true,
            },
          ],
          {
            timings: [
              {
                begin: new Date(1920532380000),
              },
            ],
          },
          settings,
        );

        expect(clean).toEqual([
          {
            category: 'CONCERT',
            musicType: 'JAZZ-BEBOP',
            venueId: 123,
            bookingContact: 'email@website.com',
          },
          {
            priceCategories: [
              {
                price: 0,
                label: 'Gratuit',
                id: 0,
              },
            ],
          },
          {
            dates: [
              {
                priceCategoryId: 0,
                quantity: 1,
                timingId: 1920532380000,
                id: 1,
              },
            ],
          },
        ]);
      });

      test('deleted items are spread and valid', () => {
        const clean = validateLocalData(
          [
            {
              eventDuration: 120,
              bookingContact: 'clement.lecroart@openagenda.com',
              response: {
                passId: 73327,
                isPending: false,
              },
              venueId: 548,
              category: 'CINE_PLEIN_AIR',
              operation: 'create',
              appliedAt: '2024-06-24T14:51:43.648Z',
              duo: true,
            },
            {
              priceCategories: [{ price: 0, label: 'Tarif unique', id: 0 }],
              response: { priceCategories: [{ passId: 4868, id: 0 }] },
              operation: 'create',
              appliedAt: '2024-06-24T14:51:44.172Z',
            },
            {
              response: {
                dates: [
                  { passId: 94950, id: 1 },
                  { passId: 94951, id: 2 },
                ],
              },
              dates: [
                {
                  quantity: 1,
                  priceCategoryId: 0,
                  timingId: 1719563400000,
                  id: 1,
                },
                {
                  quantity: 2,
                  priceCategoryId: 0,
                  timingId: 1719648000000,
                  id: 2,
                },
              ],
              operation: 'create',
              appliedAt: '2024-06-24T14:51:44.685Z',
            },
            {
              dates: [
                {
                  id: 2,
                  deleted: true,
                },
              ],
            },
          ],
          {
            timings: [
              {
                begin: new Date(1719563400000),
              },
              {
                begin: new Date(1719648000000),
              },
            ],
          },
          settings,
        );

        expect(clean[clean.length - 1]).toEqual({
          dates: [
            {
              id: 2,
              deleted: true,
            },
          ],
        });
      });
    });
  });

  describe('findLastVenueIdFromData', () => {
    test('returns the last venueId from data array', () => {
      const data = [
        { venueId: 123, category: 'CONCERT' },
        { priceCategories: [{ price: 0, label: 'Gratuit' }] },
        { dates: [{ id: 1, quantity: 1 }] },
        { venueId: 789 }, // This should be returned as it's the last one
      ];

      const result = findLastVenueIdFromData(data);
      expect(result).toBe(789);
    });

    test('returns the first venueId when only one exists', () => {
      const data = [
        { venueId: 456, category: 'CONCERT' },
        { priceCategories: [{ price: 0, label: 'Gratuit' }] },
        { dates: [{ id: 1, quantity: 1 }] },
      ];

      const result = findLastVenueIdFromData(data);
      expect(result).toBe(456);
    });

    test('returns null when no venueId exists in data', () => {
      const data = [
        { category: 'CONCERT' },
        { priceCategories: [{ price: 0, label: 'Gratuit' }] },
        { dates: [{ id: 1, quantity: 1 }] },
      ];

      const result = findLastVenueIdFromData(data);
      expect(result).toBe(null);
    });

    test('returns null for empty array', () => {
      const data = [];

      const result = findLastVenueIdFromData(data);
      expect(result).toBe(null);
    });

    test('ignores falsy venueId values and returns the last truthy one', () => {
      const data = [
        { venueId: 123 },
        { venueId: null },
        { venueId: undefined },
        { venueId: 0 }, // This is falsy but should be considered valid
        { venueId: 456 },
        { venueId: '' }, // This is falsy
      ];

      const result = findLastVenueIdFromData(data);
      expect(result).toBe(456);
    });
  });
});
