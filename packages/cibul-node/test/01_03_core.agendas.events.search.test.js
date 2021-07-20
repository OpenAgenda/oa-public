'use strict';

const axios = require('axios');
const ih = require('immutability-helper');

const api = require('../api');
const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('01 - core - functional (server): core.agendas().events.search()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '001.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'queues',
        'files',
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
        'accessTokens'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(2).events.search.rebuild();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    it('response object contains total, events and sort keys', async () => {
      const response = await core.agendas(2).events.search({});
      expect(Object.keys(response)).toEqual(['total', 'events', 'sort']);
    });

    it('if neither userUid or access are provided, only published events are returned', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, { detailed: true });

      expect(events.filter(e => e.state === 2).length).toBeGreaterThan(0);
      expect(events.filter(e => e.state !== 2).length).toBe(0);
    });

    it('if access is adminmod, unpublished events are returned when requested', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, {
        detailed: true,
        access: 'administrator'
      });

      expect(events.filter(e => e.state !== 2).length).toBeGreaterThan(0);
    });

    it('if userUid is provided, it can be authorized with adminmod access, non published content is accessible', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, {
        detailed: true,
        userUid: 63170200
      });

      expect(events.filter(e => e.state !== 2).length).toBeGreaterThan(0);
    });

    it('if useAfterKey is set in options, after is to be given to navigation instead of searchAfter and result provides after instead of sort and sort as the effective sort value', async () => {
      const { sort, after, events } = await core.agendas(2).events.search({ state: null }, { size: 1 }, {
        userUid: 63170200,
        useAfterKey: true
      });

      expect(events[0].uid).toBe(1);
      expect(sort).toBe('timingsWithFeatured.asc');
      expect(after).toEqual([0, 32503683600000, 1569578400000, 1]);

      const result = await core.agendas(2).events.search({ state: null }, { size: 1, after }, {
        userUid: 63170200,
        useAfterKey: true
      });

      expect(result.events[0].uid).toBe(2);
    });
  });

  describe('api', () => {
    let server;
    let accessToken;

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json'
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM'
        }
      }).then(r => r.data.access_token);
    });

    describe('successful list for adminmod user', () => {
      let response;

      beforeAll(async () => {
        try {
          response = await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/2/events',
            headers: {
              'access-token': accessToken,
              nonce: 123987,
              'content-type': 'application/json'
            },
            params: {
              state: [-1, 0, 1, 2],
              detailed: 1
            }
          }).then(r => r.data);
        } catch (e) {
          // console.log(e);
        }
      });

      it('keys provided in response are success, sort, total, after and events', () => {
        expect(Object.keys(response)).toEqual(['success', 'sort', 'total', 'after', 'events']);
      });

      it('if user is adminmod, unpublished events can be provided', () => {
        expect(response.events.length).toBeGreaterThan(0);
        expect(response.events.filter(e => e.state !== 2).length).toBeGreaterThan(0);
      });
    });

    describe('successful get for adminmod user', () => {
      let response;

      beforeAll(async () => {
        try {
          response = await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/2/events/1',
            headers: {
              'access-token': accessToken,
              nonce: 123989,
              'content-type': 'application/json'
            },
          }).then(r => r.data);
        } catch (e) {
          // console.log(e);
        }
      });

      it('non published events are gettable by adminmods', () => {
        expect(response.event.uid).toBe(1);
      });

      it('detailed fields - like member - are in response', () => {
        expect(response.event.member).toBeDefined();
      });
    });

    describe('successful list for non adminmod user', () => {
      let response;

      beforeAll(async () => {
        try {
          response = await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/2/events',
            headers: {
              'content-type': 'application/json'
            },
            params: {
              key: '1hFOmegP30toI8hA1if8auC6aMbVg1N9',
              state: [-1, 0, 1, 2],
              detailed: 1
            }
          }).then(r => r.data);
        } catch (e) {
          // console.log(e);
        }
      });

      it('does not contain unpublished events', () => {
        expect(response.events.length).toBeGreaterThan(0);
        expect(response.events.filter(e => e.state !== 2).length).toBe(0);
      });
    });

    describe('successful get for non adminmod user', () => {
      it('non published events are not gettable by non adminmods', async () => {
        let error;

        try {
          await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/2/events/1',
            headers: {
              'content-type': 'application/json'
            },
            params: {
              key: '1hFOmegP30toI8hA1if8auC6aMbVg1N9'
            }
          });
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(404);
      });

      it('published events are gettable by non adminmods', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/2',
          headers: {
            'content-type': 'application/json'
          },
          params: {
            key: '1hFOmegP30toI8hA1if8auC6aMbVg1N9'
          }
        }).then(r => r.data);

        expect(response.event.uid).toBe(2);
      });
    });

    describe('navigation', () => {
      const responses = [];

      beforeAll(async () => {
        const axiosParams = {
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events',
          headers: {
            'content-type': 'application/json'
          },
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            state: [-1, 0, 1, 2],
            size: 1,
            sort: 'updatedAt.desc'
          }
        };

        try {
          responses.push(await axios(axiosParams).then(r => r.data));

          const { after } = responses[0];

          responses.push(await axios(ih(axiosParams, {
            params: {
              after: { $set: after }
            }
          })).then(r => r.data));
        } catch (e) {
          // console.log(e);
        }
      });

      it('after key allows getting the next results', () => {
        expect(responses[0].events[0].uid).toBe(1);
        expect(responses[1].events[0].uid).toBe(2);
      });
    });
  });
});
