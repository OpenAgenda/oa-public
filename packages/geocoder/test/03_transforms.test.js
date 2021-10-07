'use strict';

const applyTransforms = require('../Opencage/lib/applyTransforms');

describe('post-geocode transforms', () => {
  describe('Rhone && Métropole de Lyon', () => {
    it('Ecully is in Métropole de Lyon', () => {
      const transformed = applyTransforms({
        adminLevel4: 'Ecully'
      });

      expect(transformed).toEqual({
        adminLevel4: 'Ecully',
        adminLevel2: 'Métropole de Lyon'
      });
    });

    it(
      'Noisy Lyon is in Métropole de Lyon and is cleaned. Regex transform match',
      () => {
        const transformed = applyTransforms({
          adminLevel4: 'Lyon 8ème'
        });

        expect(transformed).toEqual({
          adminLevel4: 'Lyon',
          adminLevel2: 'Métropole de Lyon'
        });
      }
    );
  });
});
