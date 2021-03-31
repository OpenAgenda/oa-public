'use strict';

const _ = require('lodash');
const assert = require('assert');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const api = require('../api');

const Core = require('../core');
const Services = require('../services/init');

const testConfig = require('./testConfig');

describe('01 - core - functional (server): core.agendas().events.search()', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '001.sql'));
  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'queues',
        'files',
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
        'accessTokens'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(2).events.search.rebuild();
  });

  afterAll(() => {
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  it('response object contains total, events and sort keys', async () => {
    // core should authorize certain types of requests.
    // like state: it cannot be picked from public user
    // passing user to core should be same everywhere
    const response = await core.agendas(2).events.search({ state: null });
    assert.deepEqual(Object.keys(response), ['total', 'events', 'sort']);
  });

});
