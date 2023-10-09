'use strict';

const fs = require('node:fs');

const imageStream = fs.createReadStream(`${__dirname}/fixtures/images/vieilles_pierres.jpg`);

const validate = require('../lib/validate');

const fixture = {
  name: 'Alice',
  address: '8 rue Alice, 92400 Courbevoie',
  latitude: 42,
  longitude: 2.1,
  countryCode: 'FR',
};

describe('validate', () => {
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
      const { imageRightsAreHeld } = validate({
        ...fixture,
        image: imageStream,
        imageRightsAreHeld: true,
      }, {
        ignoreImage: true,
      });
      expect(imageRightsAreHeld).toBe(true);
    });
  });
});
