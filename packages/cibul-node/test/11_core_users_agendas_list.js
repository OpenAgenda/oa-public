'use strict';

const _ = require('lodash');
const axios = require('axios');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/11_core_users_agendas_list.sql');

const api = require('../api');
const core = require('../core');

const testConfig = require('./testConfig');

describe('11 - core - functional (server): core.users().agendas.list', function() {

  this.timeout(10000);

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
        'keys'
      ]
    });
  });

  after(() => testConfig.knex.destroy());

  describe('results contents', function() {
    let result;

    before(async () => {
      result = await core.users({ uid: 1 }).agendas.list({ limit: 2 });
    });

    it('total, items and after keys are part of results', () => {
      result.total.should.equal(4);
      _.isArray(result.items).should.equal(true);
      _.isInteger(result.after).should.equal(true);
    });

    it('items provide agenda details', () => {
      result.items[0].title.should.equal('Un agenda thématique');
    });

    it('a member key in each item provide details on member information', () => {
      result.items[0].member.should.eql({
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

    before(async () => {
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

      titles.should.eql([
        'Un agenda thématique',
        'Les Plus Beaux Villages de France',
        "Office de tourisme La Baule - Presqu'île de Guérande",
        'Parc de la Villette'
      ]);
    });

    it('last after is null', () => {
      should(_.last(results).after).equal(null);
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
          url: `http://localhost:3000/v2/me/agendas?key=${key}`
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

  });

});
