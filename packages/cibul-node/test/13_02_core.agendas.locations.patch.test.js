'use strict';

const _ = require('lodash');
const assert = require('assert');

const Core = require('../core');
const Services = require('../services/init');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');


describe('13 - core - functional(server): core.agendas().locations.patch', () => {
  let core;
  let stopSearchTask;

  beforeAll(() => loadFixtures(testConfig.db, '016.sql'));
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
        'aggregators',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'accessTokens',
        'tracker'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(64260763).events.search.rebuild();
    await core.agendas(89904399).events.search.rebuild();

    core.services.agendaLocations.task({ reset: true });
    stopSearchTask = services.aggregators.task().stopAndClear;
  });

  afterAll(async () => {
    await stopSearchTask();
    await core.services.agendaLocations.task.stop({ reset: true });
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  it('location is patched', async () => {
    await core.agendas(64260763).locations.patch(37923057, {
      name: 'Un étang'
    });

    const row = await core.services.knex('location').first(['placename']).where('uid', 37923057);
    assert.equal(row.placename, 'Un étang');
  });

  it('index of agenda where location is patched is refreshed', done => {
    core.agendas(64260763).locations.patch(37923057, {
      address: '13 rue du désespoir, Roubaix'
    });

    core.services.tracker.on('eventSearch.onUpdate.agendas_89904399', async stack => {
      const { events } = await core.agendas(64260763).events.search({ locationUid: 37923057 });
      assert.equal(events[0].location.address, '13 rue du désespoir, Roubaix');
      done();
    }, true);
  });

  it('indices in other agendas referencing events linked to patched location are refreshed', done => {
    core.agendas(64260763).locations.patch(37923057, {
      address: '23 rue de l\'Espérance, 59100 Roubaix'
    });

    core.services.tracker.on('eventSearch.onUpdate.agendas_89904399', async stack => {
      const { events } = await core.agendas(89904399).events.search({ locationUid: 37923057 });
      assert.equal(events[0].location.address, '23 rue de l\'Espérance, 59100 Roubaix');
      done();
    }, true);
  });
});