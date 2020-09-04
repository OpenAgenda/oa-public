'use strict';

const assert = require('assert');
const slug = require('slug');

const config = require('../testconfig');
const fixtures = require('./fixtures/load');
const Service = require('../');

describe('agenda-locations - functional - terms', () => {
  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaIdByUid: async uid => ({
          7196947: 25221
        })[uid],
        locationsWillMerge: async (mergeIn, merged) => {}
      }
    });
  });

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
