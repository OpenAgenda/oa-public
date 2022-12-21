'use strict';

const axios = require('axios');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');
const loadFixtures = require('./fixtures/load');

describe('core - functional (server): core agendas() events.remove()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '006.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
        'files',
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
        'accessTokens',
        'tracker',
      ],
    });

    core = Core(services, testConfig);

    await core.agendas(17026800).events.search.rebuild();
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) { /* */ }
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('remove from other agenda', () => {
    let event;
    let searchResultBefore;

    beforeAll(async () => {
      searchResultBefore = await core.agendas(17026800).events.search({ uid: 19201989 });
    });

    beforeAll(async () => {
      event = await core.agendas(17026800).events.remove(19201989);
    });

    it('result is removed event', () => {
      expect(event.uid).toBe(19201989);
    });

    it('event is removed from agenda search', async () => {
      const {
        total,
      } = await core.agendas(17026800).events.search({ uid: 19201989 });
      expect(searchResultBefore.total).toBe(1);
      expect(total).toBe(0);
    });
  });

  describe('remove from origin agenda', () => {
    let event;

    beforeAll(async () => {
      event = await core.agendas(17026855).events.remove(19201978);
    });

    it('result is removed event', () => {
      expect(event.uid).toBe(19201978);
    });
  });

  describe('remove draft event', () => {
    let eventBefore;
    let eventAfter;

    beforeAll(async () => {
      eventBefore = await core.agendas(17026855).events.get(89378913);
    });

    beforeAll(async () => {
      await core.agendas(17026855).events.remove(89378913);
    });

    beforeAll(async () => {
      eventAfter = await core.agendas(17026855).events.get(89378913);
    });

    it('draft event is removed', () => {
      expect(eventBefore.uid).toBe(89378913);
      expect(eventAfter).toBeNull();
    });
  });

  describe('errors', () => {
    it('remove non-existing event throws NotFound exception', async () => {
      let error;
      try {
        await core.agendas(17026855).events.remove(99999999);
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('NotFound');
    });
  });

  describe('api', () => {
    let server;
    let accessToken;
    let response;

    beforeAll(async () => {
      server = api(core).listen(3000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      }).then(r => r.data.access_token);
    });

    beforeAll(async () => {
      response = await axios({
        method: 'delete',
        url: 'http://localhost:3000/agendas/17026855/events/90298390',
        headers: {
          'content-type': 'application/json',
          'access-token': accessToken,
          nonce: 129038,
        },
      }).then(r => r.data);
    });

    it('response gives success key at true if creation was a success', () => {
      expect(response.success).toBe(true);
    });

    it('response provides the deleted event', () => {
      expect(response.event.uid).toBe(90298390);
    });

    it('deleting non-existant event returns 404', async () => {
      const errorResponse = await axios({
        method: 'delete',
        url: 'http://localhost:3000/agendas/17026855/events/90298390',
        headers: {
          'content-type': 'application/json',
          'access-token': accessToken,
          nonce: 12987897,
        },
      }).then(() => {}, err => err.response);

      expect(errorResponse.status).toBe(404);
    });
  });
});
