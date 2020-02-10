'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/04_core_agendas_events_add.sql');

const core = require('../core');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().events add()', function() {
  this.timeout(20000);

  before(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  before(() => assignClients(testConfig));

  before(async () => {
    await core.init(testConfig, {
      enabled: [
        'queues',
        'events',
        'agendas',
        'aggregators',
        'agendaEvents',
        'agendaLocations',
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

  describe('simple add', function() {
    let event;

    before(async () => {
      event = await core.agendas(17026800).events.add(19201989, {
        'thematiques-metropolitaines': 3
      }, {
        context: {
          userUid: 63170203
        }
      });
    });

    it('provides the added event as a response', () => {
      event.uid.should.equal(19201989);
    });

    it('destination agenda additional field value is in response', () => {
      event['thematiques-metropolitaines'].should.eql([3]);
    });

  });

  describe('aggregated add', function() {
    let result;

    before(async () => {
      result = await core.agendas(17026800).events.add(18992812, {
        state: 2,
        'thematiques-metropolitaines': 3
      }, {
        sourceAgenda: {
          uid: 17026855
        },
        aggregated: true,
        returnPayload: true
      });
    });

    it('agenda event reference is flagged as aggregated', () => {
      result.event.aggregated.should.equal(true)
    });

    it('agenda event reference stores agenda source uid', () => {
      result.event.sourceAgendaUid.should.eql([17026855]);
    });
  });

});
