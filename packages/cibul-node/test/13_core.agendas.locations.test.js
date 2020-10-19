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
        'knex',
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
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  describe('list', function() {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855
      }).locations.list();
    });

    it('locations are placed in an items key', () => {
      assert.equal(result.items[0].name, 'Eglise');
    });
  });

  describe('create', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855
      }).locations.create({
        name: 'Bar le Richemont',
        address: 'Place de l\'église',
        city: 'Sarzeau',
        countryCode: 'FR'
      });
    });

    it('location is created', () => {
      assert(typeof result.uid === 'number');
    });
  });

  describe('patch', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855
      }).locations.patch(24505639, {
        name: 'Patched location'
      });
    });

    it('the location is patched', () => {
      assert(result.name === 'Patched location');
    });
  });

  describe('remove', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 9955517
      }).locations.remove(9955517);
    });

    it('location is removed', async () => {
      assert(await testConfig.knex('location').first().where('uid', 9955517) === undefined);
    });
  });

});
