'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');

const fixtures = require('./fixtures/010.sql');

const Services = require('../services/init');
const Core = require('../core');

const schemaNames = require('./mock/schemaNames');
const getLogConfig = require('./mock/getLogConfig');
const assignClients = require('./utils/assignClients');

const testConfig = require('./testConfig');

describe('09 - core - fuctional (server): core.agendas().events.batch()', function() {
  let core;

  beforeAll(async () => {
    const con = mysql.createConnection(Object.assign( _.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'queues',
        'files',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'aggregators',
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
  });

  afterAll(() => {
    testConfig.knex.destroy();
    testConfig.redisClient.quit();
  });

  describe('basic batch', () => {
    let result;

    beforeAll(done => {
      let called = false;
      core.agendas(1).events.batch('update', {
        state: 0
      }, { state: 1 }, {
        partial: true,
        context: { userUid: 1 }
      } );

      core.tasks({
        execute: function(...args) {
          //console.log('execute', args);
        },
        error: function(...args) {
          console.log('error', JSON.stringify(args));
          done(new Error('error'));
        },
        success: function(...args) {
          if(args[0] === 'batchedUpdate') return done();
        }
      });

    });

    it('event is updated through batch operation', async () => {
      const event = await core.agendas(1).events.get(2);
      expect(event.state).toBe(1);
    });

  });

});
