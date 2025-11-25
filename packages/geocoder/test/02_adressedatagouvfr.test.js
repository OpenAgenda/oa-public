import _ from 'lodash';
import AdresseDataGouvFR from '../AdresseDataGouvFR.js';

describe('adresse.data.gouv.fr', () => {
  const geocode = AdresseDataGouvFR();

  describe('forward', () => {
    it('A simple geocode only provides sparse data', async () => {
      expect(
        _.keys(
          await geocode('139 rue des arts, Roubaix', {
            first: true,
          }),
        ),
      ).toEqual([
        'address',
        'city',
        'postalCode',
        'insee',
        'latitude',
        'longitude',
      ]);
    });
  });

  describe('detailed', () => {
    it('Provides region and department for Roubaix', async () => {
      const result = await geocode.detailed('139 rue des arts, Roubaix');

      expect(_.keys(result)).toEqual([
        'address',
        'city',
        'postalCode',
        'insee',
        'latitude',
        'longitude',
        'department',
        'region',
      ]);

      expect(result.department).toBe('Nord');
      expect(result.region).toBe('Hauts-de-France');
    });

    it('St-Malo gives Saint-Malo', async () => {
      const result = await geocode.detailed(
        'Terre-Plein du Naye, 35400 St-Malo, France',
      );

      expect(result.city).toBe('Saint-Malo');
      expect(result.department).toBe('Ille-et-Vilaine');
      expect(result.region).toBe('Bretagne');
    });

    it('Lyon', async () => {
      const result = await geocode.detailed(
        '43 rue des Hérideaux, Lyon, France',
      );
      expect(result.city).toBe('Lyon');
    });

    it('Strasbourg', async () => {
      const result = await geocode.detailed(
        '15 place André Maurois, 67201 Strasbourg',
      );
      expect(result.city).toBe('Strasbourg');
      expect(result.postalCode).toBe('67200'); // not 67201
    });
  });
});
