'use strict';

const assert = require('assert');
const slug = require('slugify');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');

describe('agenda-locations - functional - terms', function() {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      interfaces: {
        getAgendaDetailsByUid: async uid => ({
          id: ({
            7196947: 25221
          })[uid]
        }),
        locationsWillMerge: async (mergeIn, merged) => {}
      }
    });
  });

  describe('basic', () => {
    it('result is list of values for requested terms', async () => {
      const terms = await svc(7196947).terms(['region', 'department']);

      assert.deepEqual(terms, [
        { region: null, department: null },
        { region: 'Auvergne-Rhône-Alpes', department: 'Ardèche' },
        { region: 'Un nom de région', department: 'Un nom de département' }
      ]);
    });

    it('if filterNulls is set, only non-null terms are returned', async () => {
      const terms = await svc(7196947).terms(['region', 'department'], {}, { filterNulls: true });

      assert.deepEqual(terms, [
        { region: 'Auvergne-Rhône-Alpes', department: 'Ardèche' },
        { region: 'Un nom de région', department: 'Un nom de département' }
      ]);
    });

    it('result is ordered following the last requested term, in ascending order', async () => {
      const terms = await svc(7196947).terms(['department', 'city'], {}, { filterNulls: true });

      for (let i = 1; i<terms.length; i++) {
        assert.ok(slug(terms[i-1].city, { lower: true }) <= slug(terms[i].city, { lower: true }));
      }
    });
  });

  describe('sets', () => {

    it('result is list of values for requested terms', async () => {
      const terms = await svc.sets(1903810).locations.terms(['region', 'department']);

      assert.deepEqual(terms, [{
        region: 'Auvergne-Rhône-Alpes',
        department: 'Ardèche'
      }]);
    });

  });

});
