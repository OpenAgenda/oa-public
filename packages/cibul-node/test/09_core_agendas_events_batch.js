'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const fixtures = require('./fixtures/09_core_agendas_events_batch.sql');

const config = require('../config');
const core = require('../core');

const schemaNames = require('./mock/schemaNames');
const getLogConfig = require('./mock/getLogConfig');
const assignClients = require('./utils/assignClients');

const testConfig = require('./testConfig');

describe('core - fuctional (server): events batch', function() {
  this.timeout(30000);

  before( async () => {

    const con = mysql.createConnection(Object.assign( _.pick(config.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  } );

  before(() => assignClients(testConfig));

  before(async () => {
    await core.init(testConfig, {
      enabled: [
        'queues',
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
        'keys'
      ]
    });
  });

  after(() => testConfig.knex.destroy());

  describe('basic batch', () => {
    let result;

    before(done => {
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
          //console.log('error', JSON.stringify(args));
          done(new Error('error'));
        },
        success: function(...args) {
          if(args[0] === 'batchedUpdate') return done();
        }
      });

    });

    it('event is updated through batch operation', async () => {
      const event = await core.agendas(1).events.get(2);
      event.state.should.equal(1);
    });

  });

});
