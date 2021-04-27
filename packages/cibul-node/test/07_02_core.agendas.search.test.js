'use strict';

const loadFixtures = require('./fixtures/load');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('07 - core - functional (server): core.agendas().get', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '008.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'queues',
        'files',
        'events',
        'accessTokens',
        'agendas',
        'aggregators',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'agendaSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'tracker'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(92983929).events.search.rebuild();
    await core.agendas.rebuildIndex();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {

    it('search returns all indexed agendas by default', async () => {
      const { total } = await core.agendas.search();

      expect(total).toBe(2);
    });

    it('size nav value limits number of agendas returned in one call', async () => {
      const { agendas } = await core.agendas.search({}, { size: 1 });

      expect(agendas.length).toBe(1);
    });

    it('target specific agendas to fetch through uid filter', async () => {
      const { agendas } = await core.agendas.search({
        uid: [17026800]
      });

      expect(agendas.length).toBe(1);
      expect(agendas[0].uid).toBe(17026800);
    });

    it('after nav value can be used to fetch next results', async () => {
      const { agendas: allAgendas } = await core.agendas.search();
      const { agendas: firstAgendas, after } = await core.agendas.search({}, { size: 1 });

      const { agendas: nextAgendas } = await core.agendas.search({}, {
        after
      });

      expect(firstAgendas[0].uid).toBe(allAgendas[0].uid);

      expect(nextAgendas[0].uid).toBe(allAgendas[1].uid);
    });

    it('use includeFields option to fetch summary of agendas', async () => {
      const { agendas } = await core.agendas.search({}, { size: 1 }, { includeFields: ['summary']});
     
      expect(Object.keys(agendas[0]).includes('summary')).toBe(true);
    });

    it('use indexed option to include unindexed agendas in results', async () => {
      const { agendas } = await core.agendas.search({}, {}, {
        indexed: null,
        includeFields: 'indexed',
        access: 'internal'
      });

      expect(agendas.filter(a => !a.indexed).length).toBeGreaterThan(0);
      expect(agendas.filter(a => !!a.indexed).length).toBeGreaterThan(0);
    });

    it('use access option to include restricted summary values', async () => {
      const { agendas } = await core.agendas.search({}, { size: 1 }, {
        includeFields: 'summary',
        access: 'administrator'
      });

      expect(Array.isArray(agendas[0].summary.eventCountsByState)).toBe(true);
    });
  
  });
});