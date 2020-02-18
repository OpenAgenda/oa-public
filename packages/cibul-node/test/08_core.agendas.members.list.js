'use strict';

const _ = require('lodash');
const axios = require('axios');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/009.sql');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('08 - core - functional (server): core.agendas().members.list', function() {
  this.timeout(10000);
  let core;

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
    const services = await Services(testConfig, {
      enabled: [
        'accessTokens',
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

  after(() => testConfig.knex.destroy());

  describe('results contents', function() {
    let result;

    before(async () => {
      result = await core.agendas({ uid: 2 }).members.list({ limit: 2 });
    });

    it('total, items and after keys are part of results', () => {
      result.total.should.equal(5);

      _.isArray(result.items).should.equal(true);
      _.isInteger(result.after).should.equal(true);
    });

    it('next result set can be fetched using "after" value', async () => {
      const nextResult = await core.agendas({ uid: 2 })
        .members.list({ after: result.after });

      nextResult.items.length.should.equal(3);
    });

  });

  describe('api', function() {
    const key = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
    let server, accessToken, response;

    before(done => {
       server = api(core).listen(3000, done);
    });

    after(() => server.close());

    describe('successful call', () => {

      before(async () => {
        response = await axios({
          method: 'get',
          url: `http://localhost:3000/v2/agendas/2/members?key=${key}`
        }).then(r => r.data);
      });

      it('response includes a success, total, a list of items and an after key', () => {
        Object.keys(response).should.eql([
          'total',
          'after',
          'items',
          'success'
        ]);
      });

    });

    describe('invalid call', () => {
      before(async () => {
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
        response.status.should.equal(400);
      });

      it('validation errors are provided in body', () => {
        response.data.errors.should.eql([
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
