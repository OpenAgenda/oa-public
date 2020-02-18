'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const axios = require('axios');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const api = require('../api');
const Core = require('../core');
const Services = require('../services/init');

const assignClients = require('./utils/assignClients');

const fixtures = {
  sql: require('./fixtures/003.sql'),
  events: require('./fixtures/events')
};

const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create() - aggregations', function() {
  this.timeout(30000);

  const memberUserUid = 63170200;

  let core, stopTask;

  before(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures.sql);

    con.end();
  });

  before(() => assignClients(testConfig));

  before(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'tracker', // for testing
        'queues',
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

  after(async () => {
    await stopTask();
    testConfig.knex.destroy();
  });

  describe('direct aggregation', function() {
    let event, tracked;

    before(done => {
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

    it('event was aggregated', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      ref.state.should.equal(2);
    });

    it('sourcePaths is saved in agendaEvent ref', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      ref.sourcePaths.should.eql([[17026855]]);
    });
  });

  describe('aggregation after add', function() {
    const context = {
      userUid: memberUserUid
    };
    let event;

    before(async () => {
      event = await core.agendas(58025176).events.create(fixtures.events[1], {
        context,
        access: 'contributor'
      });
    });

    before(done => {
      core.agendas(17026855).events.add(event.uid, {
        'thematiques-metropolitaines': 3
      }, { context });

      core.services.tracker.on('aggregators.referenceEvent.done', stack => {
        done();
      }, true);
    });

    it('event is aggregated and source path starts at agenda where it was added', async () => {
      const ref = await core.services.agendaEvents(55268170).get(event.uid);
      ref.sourcePaths.should.eql([[17026855]]);
    });

  });
});
