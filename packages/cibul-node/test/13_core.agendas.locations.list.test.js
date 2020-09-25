'use strict';

const _ = require('lodash');
const axios = require('axios');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const assert = require('assert');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/014.sql');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('13 - core - functional(server): core.agendas().locations.list', function() {
  let core;

  beforeAll(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(testConfig.db, ['user', 'password']), {
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
  });

  afterAll(() => {
    testConfig.knex.destroy();
    testConfig.redisClient.quit();
  });

  describe('result contents', function() {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855
      }).locations.list();
    });

    afterAll(() => server.close());

    it('locations are placed in an items key', () => {
      assert.equal(result.items[0].name, 'Eglise');
    });
  });

});
