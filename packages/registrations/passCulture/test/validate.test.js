import {
  validateDate,
  validatePriceCategory,
  validateLocalData,
} from '../iso/validate.js';

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
        validateDate({ priceCategoryIndex: 1 }, { priceCategories: [] });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.priceCategoryIndex');
    });

    test('quantity must be an integer equal to or superior to 0', () => {
      let error;

      try {
        validateDate({ priceCategoryIndex: 0, quantity: 'bim' }, {
          priceCategories: ['notvalidatedheresowhatever'],
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.quantity');
    });

    test('timingId must match a defined timing', () => {
      let error;

      try {
        validateDate({ priceCategoryIndex: 0, quantity: 1, timingId: 123 }, {
          priceCategories: ['wigglypoof'],
          timings: [],
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(error.info.errors[0].code).toBe('invalid.timingId');
    });

    test('returns clean date object when input is valid', () => {
      const clean = validateDate({
        priceCategoryIndex: 0,
        quantity: '1',
        timingId: 1920532380000,
      }, {
        priceCategories: ['tottorototttoroo'],
        timings: [{
          begin: {
            date: '2030-11-10',
            hours: 10,
            minutes: 13,
          },
        }],
      });

      expect(clean).toEqual({
        priceCategoryIndex: 0,
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
      const isValid = validatePriceCategory({
        price: '🤷',
      }, { boolMode: true });

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
        price: '42',
        label: 'Prix universel',
      });

      expect(clean).toEqual({
        price: 42,
        label: 'Prix universel',
      });
    });
  });

  describe('validateLocalData', () => {
    const validData = {
      venueId: 123,
      priceCategories: [{ price: '0', label: 'Gratuit' }],
      dates: [{
        priceCategoryIndex: 0,
        quantity: '1',
        timingId: 1920532380000,
      }],
    };

    const matchingTimings = [{
      begin: {
        date: '2030-11-10',
        hours: 10,
        minutes: 13,
      },
    }];

    test('at least one price category must be defined', () => {
      let error;

      try {
        validateLocalData({}, { timings: [] });
      } catch (e) {
        error = e;
      }

      expect(
        error.info.errors.map(e => e.code),
      ).toContain('registration.pass.requiredPassCategories');
    });

    test('venueId is required', () => {
      let error;

      try {
        validateLocalData({ ...validData, venueId: undefined }, { timings: matchingTimings });
      } catch (e) {
        error = e;
      }

      expect(error.info.errors[0].code).toBe('registration.pass.invalidVenueId');
    });

    test('at least one date should be defined', () => {
      let error;

      try {
        validateLocalData({
          priceCategories: [{ price: 2, label: 'Prix tapadeubal' }],
        }, { timings: [] });
      } catch (e) {
        error = e;
      }

      expect(error.info.errors.map(e => e.code)).toContain('registration.pass.requiredDates');
    });

    test('boolMode returns false when data is not valid', () => {
      const isValid = validateLocalData({
        priceCategories: [{ price: 2, label: 'Prix tapadeubal' }],
        dates: [],
      }, {
        timings: [],
      }, { boolMode: true });

      expect(isValid).toBe(false);
    });

    test('returns clean data when input is valid', () => {
      const clean = validateLocalData(validData, { timings: matchingTimings });

      expect(clean).toEqual({
        priceCategories: [{ price: 0, label: 'Gratuit' }],
        dates: [{
          priceCategoryIndex: 0,
          quantity: 1,
          timingId: 1920532380000,
        }],
        venueId: 123,
      });
    });
  });
});
