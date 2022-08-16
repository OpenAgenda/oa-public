'use strict';

const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('11 - core - functional (server): core.users().agendas.events', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '017.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'queues',
        'events',
        'agendas',
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
        'trackers'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(17026855).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('drafts', () => {
    it('list drafts saved by user in agenda', async () => {
      const result = await core.users(63170203).agendas(17026855).events.drafts();
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].draft).toBe(1);
    });
  });

  describe('events', () => {
    it('list events owned by user in agenda', async () => {
      const result = await core.users(63170203).agendas(17026855).events.search();
      expect(result.total).toBe(3);
      expect(result.events.length).toBe(3);
    });
  });
});
