'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const axios = require('axios');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const api = require('../api');
const assignClients = require('./utils/assignClients');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');
const loadFixtures = require('./fixtures/load');

describe('core - functional (server): core agendas() events.remove()', function() {
  this.timeout(20000);
  let core;

  before(() => loadFixtures(testConfig.db, '006.sql'));

  before(() => assignClients(testConfig));

  before(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'queues',
        'events',
        'agendas',
        'agendaEvents',
        'aggregators',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'accessTokens'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(17026800).events.search.rebuild();
  });

  after(() => testConfig.knex.destroy());

  after(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  describe('remove from other agenda', () => {
    let event, searchResultBefore;

    before(async () => {
      searchResultBefore = await core.agendas(17026800).events.search({ uid: 19201989 });
    });

    before(async () => {
      event = await core.agendas(17026800).events.remove(19201989);
    });

    it('result is removed event', () => {
      event.uid.should.equal(19201989);
    });

    it('event is removed from agenda search', async () => {
      const {
        total,
        events
      } = await core.agendas(17026800).events.search({ uid: 19201989 });
      searchResultBefore.total.should.equal(1);
      total.should.equal(0);
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

  describe('api', () => {
    let server, accessToken, response;

    before(done => {
       server = api(core).listen(3000, done);
    });

    after(() => server.close());

    before(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/v2/requestAccessToken',
        headers: {
          'content-type': 'application/json'
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM'
        }
      }).then(r => r.data.access_token);
    });

    before(async () => {
      response = await axios({
        method: 'delete',
        url: 'http://localhost:3000/v2/agendas/17026855/events/90298390',
        headers: {
          'content-type': 'application/json',
          'access-token': accessToken,
          nonce: 129038
        }
      }).then(r => r.data);
    });

    it('response gives success key at true if creation was a success', () => {
      response.success.should.equal(true);
    });

    it('response provides the deleted event', () => {
      response.event.uid.should.equal(90298390);
    });

  });

});
