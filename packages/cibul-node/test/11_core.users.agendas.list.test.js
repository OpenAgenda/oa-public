'use strict';

const _ = require('lodash');
const axios = require('axios');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/012.sql');

const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('11 - core - functional (server): core.users().agendas.list()', function() {
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

  describe('results contents', function() {
    let result;

    beforeAll(async () => {
      result = await core.users({ uid: 1 }).agendas.list({ limit: 2 });
    });

    it('total, items and after keys are part of results', () => {
      expect(result.total).toBe(4);
      expect(_.isArray(result.items)).toBe(true);
      expect(_.isInteger(result.after)).toBe(true);
    });

    it('items provide agenda details', () => {
      expect(result.items[0].title).toBe('Un agenda thématique');
    });

    it('a member key in each item provide details on member information', () => {
      expect(result.items[0].member).toEqual({
        name: 'Jan',
        email: null,
        organization: null,
        phone: null,
        position: null,
        role: 'contributor'
      });
    });

  });

  describe('navigation', function() {
    const results = [];

    beforeAll(async () => {
      let after = null;
      do {
        const result = await core.users({
          uid: 1
        }).agendas.list({
          limit: 2,
          after
        });

        after = result.after;

        results.push(result);
      } while (_.last(results).items.length)
    });

    it('provided after key can be used to fetch next results', () => {
      const titles = results.reduce((titles, { items }) => titles.concat(items.map(item => item.title)), [])

      expect(titles).toEqual([
        'Un agenda thématique',
        'Les Plus Beaux Villages de France',
        "Office de tourisme La Baule - Presqu'île de Guérande",
        'Parc de la Villette'
      ]);
    });

    it('last after is null', () => {
      expect(_.last(results).after).toBeNull();
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
          url: `http://localhost:3000/v2/me/agendas?key=${key}`
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

  });

});
