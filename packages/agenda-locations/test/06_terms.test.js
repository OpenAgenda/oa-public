'use strict';

const slug = require('slugify');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');

describe('agenda-locations - functional - terms', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: {
            7196947: 25221,
          }[uid],
        }),
        beforeMerge: async (/* mergeIn, merged */) => {},
      },
    });
  });

  describe('basic', () => {
    it('result is list of values for requested terms', async () => {
      const terms = await svc(7196947).terms(['region', 'department']);
      expect(terms).toStrictEqual([
        {
          region: null,
          department: null,
          adminLevel1: null,
          adminLevel2: null
        },
        {
          region: 'Auvergne-Rhône-Alpes',
          department: 'Ardèche',
          adminLevel1: 'Auvergne-Rhône-Alpes',
          adminLevel2: 'Ardèche'
        },
        {
          adminLevel1: null,
          adminLevel2: 'Ardèche',
          department: 'Ardèche',
          region: null,
        },
        {
          region: 'Un nom de région',
          department: 'Un nom de département',
          adminLevel1: 'Un nom de région',
          adminLevel2: 'Un nom de département'
        },
      ]);
    });

    it('if filterNulls is set, only non-null terms are returned', async () => {
      const terms = await svc(7196947).terms(
        ['region', 'department'],
        {},
        { filterNulls: true }
      );

      expect(terms).toStrictEqual([
        {
          region: 'Auvergne-Rhône-Alpes',
          department: 'Ardèche',
          adminLevel1: 'Auvergne-Rhône-Alpes',
          adminLevel2: 'Ardèche'
        },
        {
          region: 'Un nom de région',
          department: 'Un nom de département',
          adminLevel1: 'Un nom de région',
          adminLevel2: 'Un nom de département'
        },
      ]);
    });

    it('result is ordered following the last requested term, in ascending order', async () => {
      const terms = await svc(7196947).terms(
        ['department', 'city'],
        {},
        { filterNulls: true }
      );

      for (let i = 1; i < terms.length; i++) {
        expect(slug(terms[i - 1].city, { lower: true }) <= slug(terms[i].city, { lower: true })).toBeTruthy();
      }
    });
  });

  describe('sets', () => {
    it('result is list of values for requested terms', async () => {
      const terms = await svc
        .sets(1903810)
        .locations.terms(['region', 'department']);

      expect(terms).toStrictEqual([
        {
          region: 'Auvergne-Rhône-Alpes',
          department: 'Ardèche',
          adminLevel1: 'Auvergne-Rhône-Alpes',
          adminLevel2: 'Ardèche'
        },
      ]);
    });
  });
});
