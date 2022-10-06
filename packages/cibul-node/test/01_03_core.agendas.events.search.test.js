'use strict';

const axios = require('axios');
const ih = require('immutability-helper');
const { produce } = require('immer');

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
        'simpleCache',
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
        'oembed',
        'legacy',
        'users',
        'keys',
        'accessTokens',
      ],
    });

    core = Core(services, testConfig);

    await core.agendas(2).events.search.rebuild();
    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    it('response object contains total, events and sort keys', async () => {
      const response = await core.agendas(2).events.search({});
      expect(Object.keys(response)).toEqual(['total', 'events', 'sort']);
    });

    it('event item contains description field by default', async () => {
      const { events } = await core.agendas(2).events.search({});

      expect(Object.keys(events[0]).includes('description')).toBeTruthy();
    });

    it('if neither userUid or access are provided, only published events are returned', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, { detailed: true });

      expect(events.filter(e => e.state === 2).length).toBeGreaterThan(0);
      expect(events.filter(e => e.state !== 2).length).toBe(0);
    });

    it('if access is adminmod, unpublished events are returned when requested', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, {
        detailed: true,
        access: 'administrator',
      });

      expect(events.filter(e => e.state !== 2).length).toBeGreaterThan(0);
    });

    it('if search part of query contains an integer, a uid filter is applied', async () => {
      const { events, total } = await core.agendas(2).events.search({
        state: null,
        search: '1',
      }, {}, { access: 'administrator' });

      expect(total).toBe(1);
      expect(events[0].uid).toBe(1);
    });

    it('if includeLabels option is set, additional field values are provided with labels', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, {
        detailed: true,
        access: 'administrator',
        includeLabels: true,
      });

      expect(events[0].thematique).toEqual({ id: 2, label: { fr: 'Exposition' } });
    });

    it('if monolingal option is specified, additional field values are provided with monolingual labels', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, {
        detailed: true,
        access: 'administrator',
        includeLabels: true,
        monolingual: 'fr',
      });

      expect(events[0].thematique).toEqual({
        id: 2,
        label: 'Exposition',
      });
    });

    it('location image provides full path with includeLocationImagePath option', async () => {
      const { events } = await core.agendas(2).events.search({
        state: null,
        locationUid: 1,
      }, { size: 1 }, {
        detailed: true,
        includeLocationImagePath: true,
      });

      expect(events[0].location.image).toBe('https://openagendatest.s3.amazonaws.com/52b2e21bcb584c20b4abb00f4589f9de.base.image.jpg');
    });

    it('if userUid is provided, it can be authorized with adminmod access, non published content is accessible', async () => {
      const { events } = await core.agendas(2).events.search({ state: null }, {}, {
        detailed: true,
        userUid: 63170200,
      });

      expect(events.filter(e => e.state !== 2).length).toBeGreaterThan(0);
    });

    it('fix: image credits are provided', async () => {
      const { events } = await core.agendas(2).events.search();
      expect(events.filter(e => e.uid === 2)[0].imageCredits).toEqual('Gaetan Latouche');
    });

    it('if useAfterKey is set in options, after is to be given to navigation instead of searchAfter and result provides after instead of sort and sort as the effective sort value', async () => {
      const { sort, after, events } = await core.agendas(2).events.search({ state: null }, { size: 1 }, {
        userUid: 63170200,
        useAfterKey: true,
      });

      expect(events[0].uid).toBe(1);
      expect(sort).toBe('timingsWithFeatured.asc');
      expect(after).toEqual([0, 32503680000000, 1569578400000, 1]);

      const result = await core.agendas(2).events.search({ state: null }, { size: 1, after }, {
        userUid: 63170200,
        useAfterKey: true,
      });

      expect(result.events[0].uid).toBe(2);
    });

    it('fix: updatedAt is latest between ae and event timestamps', async () => {
      const { events } = await core.agendas(2).events.search({
        state: null,
        uid: 1,
      }, {}, {
        access: 'administrator',
        detailed: true,
      });

      expect(
        new Date(events.pop().updatedAt).getTime()
      ).toBe(
        new Date('2022-06-30T09:00:00.000Z').getTime()
      );
    });

    it('longDescriptionFormat option set to HTML', async () => {
      const { events } = await core.agendas(2).events.search({}, { size: 1 }, {
        longDescriptionFormat: 'HTML',
        detailed: true,
        userUid: 63170200,
      });

      expect(events[0].longDescription.fr.substr(0, 38)).toBe('<p><strong>! CHANGEMENT !</strong></p>');
    });

    it('longDescriptionFormat option set to HTMLWithEmbeds', async () => {
      const { events } = await core.agendas(2).events.search({}, { size: 1 }, {
        longDescriptionFormat: 'HTMLWithEmbeds',
        detailed: true,
        userUid: 63170200,
      });

      expect(events[0].longDescription.fr).toContain('<iframe');
    });

    it('aggregations can requested through options', async () => {
      const { aggregations } = await core.agendas(2).events.search({}, { size: 0 }, {
        aggregations: ['states'],
      });
      expect(aggregations.states).toBeDefined();
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
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
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
              'content-type': 'application/json',
            },
            params: {
              state: [-1, 0, 1, 2],
              detailed: 1,
            },
          }).then(r => r.data);
        } catch (e) {
          // console.log(e);
        }
      });

      it('keys provided in response are success, sort, total, after and events', () => {
        expect(
          Object.keys(response)
            .filter(
              key => ['success', 'sort', 'total', 'after', 'events'].includes(key)
            ).length
        ).toEqual(5);
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
              'content-type': 'application/json',
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

    describe('restricted for administrators', () => {
      // Je dois rajouter un test avec un contributeur qui va chercher
      // ce même événement et qui ne voit pas le champ admin
      it('administrators have access to restricted admin field', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/1',
          headers: {
            'content-type': 'application/json',
            'access-token': accessToken,
            nonce: 789789,
          },
        }).then(r => r.data);

        expect(response.event.note).toBe('Une note interne pour les administrateurs');
      });
    });

    describe('get with options', () => {
      let event;

      beforeAll(async () => {
        event = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/1?detailed=1&useDateHoursMinutesFormat=1',
          headers: {
            'access-token': accessToken,
            nonce: 1239789,
            'content-type': 'application/json',
          },
        }).then(r => r.data.event);
      });

      it('useDateHoursMinutesFormat', async () => {
        expect(event.timings[0].begin).toEqual({ date: '2019-09-27', hours: '10', minutes: '00' });
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
              'content-type': 'application/json',
            },
            params: {
              key: '1hFOmegP30toI8hA1if8auC6aMbVg1N9',
              state: [-1, 0, 1, 2],
              detailed: 1,
            },
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
      const nonAdminModKey = '1hFOmegP30toI8hA1if8auC6aMbVg1N9';

      it('non published events are not gettable by non adminmods', async () => {
        let error;

        try {
          await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/2/events/1',
            headers: {
              'content-type': 'application/json',
            },
            params: {
              key: nonAdminModKey,
            },
          });
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(403);
      });

      it('published events are gettable by non adminmods', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/2',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: nonAdminModKey,
          },
        }).then(r => r.data);

        expect(response.event.uid).toBe(2);
      });

      it('administrator field is not visible to non adminmod', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/1',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1Nz',
          },
        }).then(r => r.data);

        expect(response.event.note).toBeUndefined();
      });

      it('get by slug', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/slug/event-2',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: nonAdminModKey,
          },
        }).then(r => r.data);

        expect(response.event.uid).toBe(2);
      });

      it('includeFields: get by slug with additional field labels', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/slug/event-1?detailed=1&includeLabels=1',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1Nz',
          },
        }).then(r => r.data);

        expect(response.event.thematique).toEqual({
          id: 2,
          label: { fr: 'Exposition' },
        });
      });

      it('unpublished event is gettable by owning contributor', async () => {
        const { event } = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/1',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1Nz',
          },
        }).then(r => r.data);

        expect(event.uid).toEqual(1);
      });

      it('unpublished event is not gettable by other contributor', async () => {
        let error;

        try {
          await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/2/events/1',
            headers: {
              'content-type': 'application/json',
            },
            params: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1NL',
            },
          });
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(403);
      });

      it('draft event is not gettable from agenda other than one with which it is associated', async () => {
        let error;
        try {
          await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/1/events/3',
            headers: {
              'content-type': 'application/json',
            },
            params: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1Nz',
            },
          });
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(404);
      });

      it('draft event is gettable by contributing contributor', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events/3',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1Nz',
          },
        });

        expect(response.status).toBe(200);
      });

      it('draft event restricted data is gettable by credded user', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/1/events/4',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: 'egP36aMb0toI8auC1Vg1NL8hAhFOm1if',
          },
        });

        expect(response.data.event.note).toBe('Une autre note interne');
      });

      it('draft event is not gettable by other user', async () => {
        let error;

        try {
          await axios({
            method: 'get',
            url: 'http://localhost:3000/agendas/2/events/3',
            headers: {
              'content-type': 'application/json',
            },
            params: {
              key: '1hFOmegP30toI8hA1if8auC6aMbVg1N9',
            },
          }).then(r => r.data);
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(403);
      });
    });

    describe('navigation', () => {
      const responses = [];

      beforeAll(async () => {
        const axiosParams = {
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            state: [-1, 0, 1, 2],
            size: 1,
            sort: 'updatedAt.desc',
          },
        };

        try {
          responses.push(await axios(axiosParams).then(r => r.data));

          const { after } = responses[0];

          responses.push(await axios(ih(axiosParams, {
            params: {
              after: { $set: after },
            },
          })).then(r => r.data));
        } catch (e) {
          // console.log(e);
        }

        try {
          responses.push(await axios(produce(axiosParams, draft => {
            draft.params.size = 2;
            draft.params.from = 1;
          })).then(r => r.data));
        } catch (e) {
          // console.log(e);
        }
      });

      it('after key allows getting the next results', () => {
        expect(responses[0].events[0].uid).toBe(1);
        expect(responses[1].events[0].uid).toBe(2);
      });

      it('from can be used via api', async () => {
        expect(responses[2].events[0].uid).toEqual(responses[1].events[0].uid);
      });
    });

    describe('options', () => {
      it('aggregations can be requested through query params', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/2/events',
          headers: {
            'content-type': 'application/json',
          },
          params: {
            key: '1hFOmegP30toI8hA1if8auC6aMbVg1N9',
            state: [-1, 0, 1, 2],
            detailed: 1,
            aggregations: 'states',
          },
        }).then(r => r.data);

        expect(response.aggregations).toBeDefined();
      });
    });
  });
});
