'use strict';

const _ = require('lodash');
const axios = require('axios');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('08 - core - functional (server): core.agendas().members.list', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '009.sql'));
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

  describe('results contents', function() {
    let result;

    beforeAll(async () => {
      result = await core.agendas({ uid: 2 }).members.list({ limit: 2 });
    });

    it('total, items and after keys are part of results', () => {
      expect(result.total).toBe(5);

      expect(_.isArray(result.items)).toBe(true);
      expect(_.isInteger(result.after)).toBe(true);
    });

    it('next result set can be fetched using "after" value', async () => {
      const nextResult = await core.agendas({ uid: 2 })
        .members.list({ after: result.after });

      expect(nextResult.items.length).toBe(3);
    });

  });

  describe('api', function() {
    const key = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
    let server, accessToken, response;

    beforeAll(done => {
       server = api(core).listen(3000, done);
    });

    afterAll(() => server.close());

    describe('successful call', () => {

      beforeAll(async () => {
        response = await axios({
          method: 'get',
          url: `http://localhost:3000/v2/agendas/2/members?key=${key}`
        }).then(r => r.data);
      });

      it('response includes a success, total, a list of items and an after key', () => {
        expect(Object.keys(response)).toEqual([
          'total',
          'after',
          'items',
          'success'
        ]);
      });

    });

    describe('invalid call', () => {
      beforeAll(async () => {
        try {
          await axios({
            method: 'get',
            url: `http://localhost:3000/v2/agendas/2/members?key=${key}&limit=1111`
          })
        } catch (e) {
          response = e.response;
        }
      });

      it('status is 400 if invalid query is provided', () => {
        expect(response.status).toBe(400);
      });

      it('validation errors are provided in body', () => {
        expect(response.data.errors).toEqual([
          {
            code: 'integer.toobig',
            message: 'the integer is too big',
            values: { max: 100 },
            origin: '1111',
            field: 'limit'
          }
        ]);
      });

    });
  });

});
