'use strict';

const _ = require('lodash');
const axios = require('axios');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');

const api = require('../api');
const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');

const assignClients = require('./utils/assignClients');

const fixtures = {
  events: require('./fixtures/events')
};

const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create() - aggregations', function() {
  const memberUserUid = 63170200;

  let core, stopTask;

  beforeAll(() => loadFixtures(testConfig.db, '003.sql'));
  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'tracker', // for testing
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
        'accessTokens'
      ]
    });

    core = Core(services, testConfig);

    stopTask = services.aggregators.task().stopAndClear;
  });

  afterAll(async () => {
    await stopTask();
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  describe('direct aggregation', function() {
    let event, tracked;

    beforeAll(done => {
      core.services.tracker.on('aggregators.referenceEvent.done', stack => {
        done();
      }, true);

      core.agendas(17026855).events.create(fixtures.events[2], {
        context: {
          userUid: memberUserUid
        },
        access: 'contributor'
      }).then(e => { event = e; });
    });

    it('event was aggregated, taking default state', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      expect(ref.state).toBe(2);
    });

    it('sourcePaths is saved in agendaEvent ref', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      expect(ref.sourcePaths).toEqual([[17026855]]);
    });
  });

  describe('aggregation after add', function() {
    const context = {
      userUid: memberUserUid
    };
    let event;

    beforeAll(async () => {
      event = await core.agendas(58025176).events.create(fixtures.events[1], {
        context,
        access: 'contributor'
      });
    });

    beforeAll(done => {
      core.agendas(17026855).events.add(event.uid, {
        'thematiques-metropolitaines': 3,
        'categories-agenda-metropolitain': 42
      }, { context });

      core.services.tracker.on('aggregators.referenceEvent.done', stack => {
        done();
      }, true);
    });

    it('event is aggregated and source path starts at agenda where it was added', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      expect(ref.sourcePaths).toEqual([[17026855]]);
    });

  });
});
