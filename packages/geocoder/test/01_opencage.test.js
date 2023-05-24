'use strict';

const _ = require('lodash');
const Opencage = require('../Opencage');
const config = require('../testconfig');

describe('opencage', () => {
  const geocode = Opencage(config.opencage);

  describe('forward', () => {
    it('Toulon', async () => {
      const res = await geocode('Toulon', {
        countryCode: 'FR',
        first: true
      });
      expect(res.adminLevel3).toBe('Métropole Toulon Provence Méditerranée');
    });
    it('Tours', async () => {
      const res = await geocode('Tours', {
        countryCode: 'FR',
        first: true
      });
      expect(res.adminLevel3).toBe('Tours Métropole Val de Loire');
    });

    it('Timezone is provided', async () => {
      expect((await geocode('Masdar, Abu Dhabi', {
        countryCode: 'AE',
        first: true
      })).timezone).toBe('Asia/Dubai');
    });

    it('Empty string given, empty array returns', async () => {
      const results = await geocode(' ', {
        countryCode: 'FR'
      });

      expect(results instanceof Array).toBe(true);
      expect(results.length).toBe(0);
    });

    it('An address in Roubaix. No district provided', async () => {
      expect((await geocode('139 rue des arts, Roubaix', {
        countryCode: 'FR',
        language: 'fr',
        first: true
      })).adminLevel4).toBe('Roubaix');
    });

    it('Brussels is in Belgium', async () => {
      const res = await geocode('Place du Jeu de Balle, Bruxelles', {
        countryCode: 'BE',
        language: 'fr',
        first: true,
        raw: true
      });
      expect(res.countryCode).toBe('be');
    });

    it('St-Malo gives Saint-Malo', async () => {
      expect((await geocode('Terre-Plein du Naye, 35400 St-Malo, France', {
        countryCode: 'FR',
        language: 'fr',
        first: true
      })).adminLevel4).toBe('Saint-Malo');
    });

    it('Aruba', async () => {
      expect((await geocode('Koningstraat 38,Oranjestad Aruba', {
        countryCode: 'AW',
        language: 'fr',
        first: true
      })).adminLevel4).toBe('Oranjestad');
    });

    describe('Bordeaux-Métropole', () => {
      it('-It is Saint-Aubin de Médoc and not Saint-Aubin-de-Médoc', async () => {
        const res = await geocode('Saint-Aubin de Médoc', {
          countryCode: 'FR',
          language: 'fr',
          first: true
        });
        expect(res.adminLevel4).toBe('Saint-Aubin de Médoc');
        expect(res.adminLevel3).toBe('Bordeaux Métropole');
      });
    });

    describe('Métropole européenne de Lille', () => {
      it('Lille Centre is in Métropole européenne de Lille', async () => {
        const res = await geocode('Lille centre', {
          countryCode: 'FR',
          language: 'fr',
          first: true
        });
        expect(res.adminLevel4).toBe('Lille');
        expect(res.adminLevel3).toBe('Métropole Européenne de Lille');
      });
    });

    describe('Arles', () => {
      it('District is provided', async () => {
        const res = await geocode('10 rue des Moulins, Arles', {
          countryCode: 'FR',
          language: 'fr',
          first: true
        });
        expect(res.adminLevel6).toBe('Centre-Ville');
      });
    });

    describe('Métropole de Lyon, département du Rhône', () => {
      it('Maillane is in "Bouches-du-Rhône" department', async () => {
        const result = await geocode('11 Avenue Lamartine, Maillane', { countryCode: 'FR', first: true });
        expect(result.adminLevel2).toBe('Bouches-du-Rhône');
      });

      it('Bron is in "Métropole de Lyon" department', async () => {
        const result = await geocode('20 Rue Villard, 69500 Bron', { countryCode: 'FR', first: true, language: 'fr' });

        expect(result.adminLevel2).toBe('Métropole de Lyon');
      });

      it('Taluyers is in "Rhône" department', async () => {
        const result = await geocode('47 montée de l\'église 69440 Taluyers', { countryCode: 'FR', first: true, language: 'fr' });

        expect(result.adminLevel2).toBe('Rhône');
      });

      it(
        '43 rue des Hérideaux, Lyon is in "Métropole de Lyon" department',
        async () => {
          const result = await geocode('43 rue des Hérideaux, Lyon', { countryCode: 'FR', first: true, language: 'fr' });
          expect(result.adminLevel2).toBe('Métropole de Lyon');
        }
      );
    });

    describe('DOM-TOM', () => {

      it('Saint Pierre et Miquelon addresses respond to PM country code', async () => {
        const res = await geocode('Rue du 11 novembre B.P. 4208, Saint-Pierre, Saint-Pierre-et-Miquelon', {
          countryCode: 'PM',
          language: 'fr'
        });
        expect(res.length).toBeGreaterThan(0);
      });

      it('Guyane addresses respond to GF country code', async () => {
        expect((await geocode('78, rue Madame Payé, 97300 Cayenne', {
          countryCode: 'GF',
          language: 'fr'
        })).length).toBeGreaterThan(0);
      });

      it('Nouvelle Calédonie addresses respond to RE country code', async () => {
        expect(
          (await geocode('Maison Célières, 21, route du Port-Despointes, Faubourg-Blanchot, NOUMEA, Nouvelle-Calédonie', {
            countryCode: 'NC',
            language: 'fr'
          })).length
        ).toBeGreaterThan(0);
      });

      it('Réunion addresses respond to RE country code', async () => {
        expect((await geocode('13, Ruelle Edouard, 97400 Saint-denis', {
          countryCode: 'RE',
          language: 'fr'
        })).length).toBeGreaterThan(0);
      });

      it('Martinique addresses respond to MQ country code', async () => {
        expect((await geocode('9, rue de la Liberté, 97200 Fort-de-France', {
          countryCode: 'MQ',
          language: 'fr'
        })).length).toBeGreaterThan(0);
      });

      it('Guadeloupe addresses respond to GP country code', async () => {
        expect((await geocode('9 rue Nozières, Pointe-à-Pitre 97110, Guadeloupe', {
          countryCode: 'GP',
          language: 'fr',
          first: true
        })).adminLevel4).toBe('Pointe-à-Pitre');
      });
    });

    describe('Hong Kong', () => {
      it('Finds an address in Hong Kong', async () => {
        const result = await geocode('11 Man Kwong Street, Central, Hong Kong', {
          countryCode: 'HK',
          language: 'fr',
          first: true
        });

        expect(result.adminLevel4).toBe('Île de Hong Kong');
      });
    });

    describe('Courbevoie', () => {
      let result;
      beforeAll(async () => {
        result = await geocode('Courbevoie', {
          countryCode: 'FR',
          language: 'fr',
          first: true
        });
      });

      it('-it is in Hauts de Seine', async () => {
        expect(result.adminLevel2).toBe('Hauts-de-Seine');
      });
    });

    describe('Sarzeau', () => {
      let result;
      beforeAll(async () => {
        result = await geocode('Sarzeau', {
          countryCode: 'FR',
          language: 'fr',
          first: true,
          raw: true
        });
      });

      it('department is Morbihan', () => {
        expect(result.adminLevel2).toBe('Morbihan');
      });

      it('adminLevel4 is Sarzeau', () => {
        expect(result.adminLevel4).toBe('Sarzeau');
      });
    });

    describe('Berlin', () => {
      describe('districts', () => {
        it('Grunewald', async () => {
          const res = await geocode('Furtwänglerstraße 12, 14193 Berlin', {
            countryCode: 'DE',
            language: 'de',
            first: true
          });
          expect(res.adminLevel6).toBe('Grunewald');
        });

        it('Pankow', async () => {
          expect((await geocode('Hadlichstraße 3, 13187 Berlin', {
            countryCode: 'DE',
            language: 'de',
            first: true
          })).adminLevel6).toBe('Pankow');
        });

        it('Weißensee', async () => {
          expect((await geocode('Pistoriusstraße 23, 13086 Berlin-Weißensee', {
            countryCode: 'DE',
            language: 'de',
            first: true
          })).adminLevel6).toBe('Weißensee');
        });

        it('Prenzlauer Berg', async () => {
          expect((await geocode('Björnsonstraße 5, 10439 Berlin-Prenzlauer Berg', {
            countryCode: 'DE',
            language: 'de',
            first: true
          })).adminLevel6).toBe('Prenzlauer Berg');
        });

        it('Weißensee2', async () => {
          expect((await geocode('Behaimstraße 64, 13086 Berlin-Weißensee', {
            countryCode: 'DE',
            language: 'de',
            first: true
          })).adminLevel6).toBe('Weißensee');
        });

        it('Karow', async () => {
          expect((await geocode('Alt-Karow 14, 13125 Berlin', {
            countryCode: 'DE',
            language: 'de',
            first: true
          })).adminLevel6).toBe('Karow');
        });

        it('Kollwitzstraße', async () => {
          const result = await geocode('Kollwitzstraße 8, 10405 Berlin', {
            countryCode: 'DE',
            language: 'de',
            first: true,
          });
          expect(result.adminLevel5).toBe('Pankow');
          expect(result.adminLevel6).toBe('Prenzlauer Berg');
        });
      });
    });
  });

  describe('reverse', () => {
    describe('Lomme', () => {
      it('adminLevel4 is Lomme', async () => {
        expect((await geocode.reverse(50.6310623, 3.012141, {
          first: true,
          language: 'fr'
        })).adminLevel4).toBe('Lomme');
      });

      it('department is Nord', async () => {
        expect((await geocode.reverse(50.6310623, 3.012141, {
          first: true,
          language: 'fr'
        })).adminLevel2).toBe('Nord');
      });

      it('district', async () => {
        const res = await geocode('Place Augustin Laurent, Lille', {
          countryCode: 'FR',
          language: 'fr',
          first: true,
          raw: true,
        });
        expect(res.adminLevel6).toBe('Lille-Centre');
      });
    });

    describe('Roubaix', () => {
      let result;

      beforeAll(async () => {
        result = await geocode.reverse(50.6879439, 3.1674618, {
          first: true,
          raw: true,
          language: 'fr'
        });
      });

      it('adminLevel4 is Roubaix', () => {
        expect(result.adminLevel4).toBe('Roubaix');
      });

      it('department is Nord', () => {
        expect(result.adminLevel2).toBe('Nord');
      });

      it('district is Ouest', () => {
        expect(result.adminLevel6).toBe('Ouest');
      });
    });

    describe('Berlin', () => {
      let result;
      beforeAll(async () => {
        result = await geocode.reverse(52.5067614, 13.284651, {
          first: true,
          language: 'fr'
        });
      });

      it('have district', () => {
        expect(result.adminLevel6).toBe('Charlottenburg');
      });
    });

    describe('Courbevoie', () => {
      let result;

      beforeAll(async () => {
        result = await geocode.reverse(48.8953328, 2.2561602, {
          first: true,
          language: 'fr'
        });
      });

      it('department is Hauts-de-Seine', () => {
        expect(result.adminLevel2).toBe('Hauts-de-Seine');
      });
    });

    it('In Guyane', async () => {
      expect(_.pick(await geocode.reverse(5.6688522, -53.7819599, {
        first: true,
        language: 'fr'
      }), [
        'adminLevel4', 'adminLevel2', 'adminLevel1', 'timezone', 'country', 'countryCode'
      ])).toEqual({
        adminLevel4: 'Mana',
        adminLevel2: null,
        adminLevel1: 'Guyane',
        country: 'France',
        countryCode: 'fr',
        timezone: 'America/Cayenne'
      });
    });
  });
});
