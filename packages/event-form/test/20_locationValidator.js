import locationValidator from '../src/validators/location.js';

const DEFAULT_LOCATION = {
  uid: 999,
  name: 'Default place',
  address: '1 rue du Défaut',
};

// Shape returned once a location object has gone through the (non-draft)
// schema validator: absent sub-fields are normalized to null.
const validatedDefault = {
  uid: 999,
  name: 'Default place',
  address: '1 rue du Défaut',
  latitude: null,
  longitude: null,
  timezone: null,
};

describe('location validator', () => {
  describe('required field (e.g. publishing, attendanceMode != online)', () => {
    test('validates a provided location with a uid', () => {
      const validate = locationValidator({ optional: false, default: DEFAULT_LOCATION });

      expect(validate({ uid: 42, name: 'Somewhere' })).toEqual({
        uid: 42,
        name: 'Somewhere',
        address: null,
        latitude: null,
        longitude: null,
        timezone: null,
      });
    });

    test('falls back to the default when the value is null (saved draft)', () => {
      // A draft persists an empty location as `null`; publishing it must reuse
      // the configured default location instead of failing with "required".
      const validate = locationValidator({ optional: false, default: DEFAULT_LOCATION });

      expect(validate(null)).toEqual(validatedDefault);
    });

    test('falls back to the default when the value is undefined', () => {
      const validate = locationValidator({ optional: false, default: DEFAULT_LOCATION });

      expect(validate(undefined)).toEqual(validatedDefault);
    });

    test('still throws "location.required" when there is no default to fall back to', () => {
      const validate = locationValidator({ optional: false });

      let errors;
      try {
        validate(null);
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        expect.objectContaining({ field: 'location', code: 'location.required' }),
      ]);
    });
  });

  describe('optional field (e.g. online events / draft mode)', () => {
    test('keeps an explicit null instead of applying the default', () => {
      const validate = locationValidator({ optional: true, default: DEFAULT_LOCATION });

      expect(validate(null)).toBeNull();
    });

    test('returns the default when the value is undefined', () => {
      const validate = locationValidator({ optional: true, default: DEFAULT_LOCATION });

      expect(validate(undefined)).toEqual(DEFAULT_LOCATION);
    });
  });
});
