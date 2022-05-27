'use strict';

const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('10 - core - functional (server): core.users().remove()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '018.sql'));

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
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'trackers'
      ]
    });

    core = Core(services, testConfig);

    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  beforeAll(async () => {
    await core.users(99999967).remove();
  });

  it('user is marked as removed', async () => {
    const user = await core.services.users.findOne({
      query: { uid: 99999967 },
      removed: null,
      detailed: true
    });

    expect(user.isRemoved).toBe(true);
  });
});
