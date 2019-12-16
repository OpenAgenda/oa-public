'use strict';

//process.env.NODE_ENV = 'test';

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/05_core_agendas_events_remove.sql');

const core = require('../core');

const testConfig = require('./testConfig');

describe('core - functional (server): core agendas() events.remove()', function() {
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

  describe('remove from other agenda', () => {
    let event;

    before(async () => {
      event = await core.agendas(17026800).events.remove(19201989);
    });

    it('result is removed event', () => {
      event.uid.should.equal(19201989);
    });
  });

  describe('remove from origin agenda', () => {
    let event;

    before(async () => {
      event = await core.agendas(17026855).events.remove(19201978);
    });

    it('result is removed event', () => {
      event.uid.should.equal(19201978);
    });
  });

  describe('remove draft event', () => {

    let eventBefore, eventAfter;

    before(async () => {
      eventBefore = await core.agendas(17026855).events.get(89378913);
    });

    before(async () => {
      await core.agendas(17026855).events.remove(89378913);
    });

    before(async () => {
      eventAfter = await core.agendas(17026855).events.get(89378913);
    });

    it('draft event is removed', () => {
      eventBefore.uid.should.equal(89378913);
      should(eventAfter).equal(null);
    });

  });

});
