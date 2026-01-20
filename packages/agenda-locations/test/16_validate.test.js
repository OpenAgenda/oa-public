'use strict';

const fs = require('node:fs');
const validateExtIds = require('@openagenda/utils/validators/extIdsValidator');

const imageStream = fs.createReadStream(
  `${__dirname}/fixtures/images/vieilles_pierres.jpg`,
);

const validate = require('../lib/validate');

const fixture = {
  name: 'Alice',
  address: '8 rue Alice, 92400 Courbevoie',
  latitude: 42,
  longitude: 2.1,
  countryCode: 'FR',
};

describe('validate', () => {
  describe('address', () => {
    test('url', () => {
      let errors = [];
      try {
        validate({
          ...fixture,
          address: 'http://example.com/some-location',
        });
      } catch (e) {
        errors = e.info.errors;
      }
      expect(errors[0].code).toBe('address.invalid');
      expect(errors[0].message).toBe('address should not be a URL');
    });
  });
  describe('imageRightsAreHeld', () => {
    test('is set and cleaned as true', () => {
      const { imageRightsAreHeld } = validate({
        ...fixture,
        image: imageStream,
        imageRightsAreHeld: true,
      });

      expect(imageRightsAreHeld).toBe(true);
    });

    test('is not dropped when ignoreImage is used', () => {
      const { imageRightsAreHeld } = validate(
        {
          ...fixture,
          image: imageStream,
          imageRightsAreHeld: true,
        },
        {
          ignoreImage: true,
        },
      );
      expect(imageRightsAreHeld).toBe(true);
    });
  });

  describe('siret', () => {
    test('is set and cleaned', () => {
      const { siret } = validate({
        ...fixture,
        siret: '12345678901234',
      });
      expect(siret).toBe('12345678901234');
    });

    test('invalid siret', () => {
      let errors = [];
      try {
        validate({
          ...fixture,
          siret: '123a5678901234',
        });
      } catch (e) {
        errors = e.info.errors;
      }

      expect(errors[0].code).toBe('invalidSIRET');
    });
  });

  describe('geography', () => {
    test('timezone', () => {
      let error;
      try {
        validate({
          ...fixture,
          timezone: 'UTC+1',
        });
      } catch (e) {
        error = e;
      }
      expect(error.info.errors[0].code).toBe('timezone.invalid');
    });
  });

  describe('extIds', () => {
    test('too long', () => {
      let error;
      const value = 'SHGDJHHGHJGFQZYEUTZTQYUGUYZGQDUIQYGZJHQVBSJGQHDJKQGJYKDZGQKYDGQJKSVGJKHSQHGDJHQGZJDGQUKYYTGSDUYGQJKHZDVBJHQVBGHDJHSGDUYKQZD';
      try {
        validateExtIds({})([{ key: 'default', value }]);
      } catch (e) {
        error = e;
      }
      expect(error[0].code).toBe('string.toolong');
    });
  });
});
