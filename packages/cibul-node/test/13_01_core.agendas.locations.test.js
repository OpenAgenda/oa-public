'use strict';

const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const FormData = require('form-data');
const qs = require('qs');
const log = require('@openagenda/logs')('13_01');

const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');

const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('13 - core - functional(server): core.agendas().locations.list', () => {
  let core;

  const config = testConfig.extendWith({ queuesPrefix: 'q13_01:' });

  beforeAll(() => loadFixtures(config.db, '014.sql'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'tracker',
        'accessTokens',
        'files',
        'queues',
        'events',
        'agendas',
        'agendaEvents',
        'geocoder',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
      ],
    });

    core = Core(services, config);

    await core.agendas(93399464).events.search.rebuild();
    await core.agendas(48353388).events.search.rebuild();
    await core.agendas(17026855).events.search.rebuild();

    core.services.agendaLocations.task({ reset: true, detectDuplicates: false });
    core.services.eventSearch.task({ reset: true });
    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('list', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855,
      }).locations.list();
    });

    it('locations are placed in an items key', () => {
      expect(typeof result.items[0].name).toBe('string');
    });

    it('a total is provided in result', () => {
      expect(result.total).toBe(6);
    });

    it('an after key is provided', () => {
      expect(result.after).toBe(1);
    });

    it('integers provided in search part of query are processed as an uid filter', async () => {
      const {
        items,
        total,
      } = await core.agendas(17026855).locations.list({ search: '18927679' });

      expect(total).toBe(1);
      expect(items[0].uid).toBe(18927679);
    });

    it('filter to limit results to unverified locations', async () => {
      const {
        items: unverifiedLocations,
      } = await core.agendas(99501607).locations.list({ state: 0 }, { size: 1 });

      const {
        items: verifiedLocations,
      } = await core.agendas(99501607).locations.list({ state: 1 }, { size: 1 });

      expect(unverifiedLocations.length).toEqual(1);
      expect(verifiedLocations.length).toEqual(0);
    });

    it('include event counts in result with option', async () => {
      const {
        items,
      } = await core.agendas(17026855).locations.list({}, {}, {
        eventCounts: true,
      });

      expect(items[0].eventCount).toBe(1);
    });

    it('geo filter', async () => {
      const {
        items: geoItems,
      } = await core.agendas(17026855).locations.list({
        geo: {
          northEast: { lat: '48', lng: '5' },
          southWest: { lat: '44.37', lng: '4.00' },
        },
      }, {}, {
      });

      const {
        items,
      } = await core.agendas(17026855).locations.list({}, {}, {});
      expect(items.length).toBeGreaterThan(geoItems.length);
    });
  });

  describe('get', () => {
    let result;

    beforeAll(async () => {
      result = await core
        .agendas(17026855)
        .locations
        .get(95455142, {
          includeLinkedAgendas: true,
        });
    });

    it('get location with option includeLinkedAgendas', () => {
      expect(result.linkedAgendas).toEqual([{ uid: 17026855, title: 'La Gargouille' }]);
    });
  });

  describe('get from a set', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(55278973).locations.get(76464022);
    });

    it('location from set is given', () => {
      expect(result.uid).toEqual(76464022);
    });
  });

  describe('create', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855,
      }).locations.create({
        name: 'Bar le Richemont',
        address: 'Place de l\'église',
        city: 'Sarzeau',
        countryCode: 'FR',
      });
    });

    it('location is created', () => {
      expect(typeof result.uid).toBe('number');
    });
  });

  describe('remove', () => {
    beforeAll(async () => {
      await core.agendas({
        uid: 17026855,
      }).locations.remove(9955517);
    });

    it('location is removed', async () => {
      const location = await config.knex('location').first().where('uid', 9955517);
      expect(location.deleted).toBe(1);
    });
  });

  describe('update collaterals', () => {
    beforeAll(async () => {
      await core.agendas(48353388).locations.update(2248644, {
        name: 'Lautrec',
        address: 'Palais de la Berbie, place Sainte-Cécile, Albi',
        city: 'Albi',
        countryCode: 'FR',
        latitude: 43.92872,
        longitude: 2.142774,
        department: 'Tarn',
        region: 'Occitanie',
        postalCode: 81000,
        insee: 81004,
      });

      return new Promise(rs => {
        core.services.tracker.on('eventSearch.onUpdate.events', rs);
      });
    });

    it('related events have their location data updated', async () => {
      const { events } = await core.agendas(48353388).events.search({}, { size: 1 }, { detailed: true });

      expect(events[0].location.name).toBe('Lautrec');
    });
  });

  describe('api', () => {
    let server;
    let accessToken;
    let response;

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

    describe('successful create by administrator', () => {
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/locations',
            headers: {
              'access-token': accessToken,
              nonce: 1231456,
              'content-type': 'application/json',
            },
            data: {
              name: 'Chez les beaufs de kevin',
              address: '12 grande rue, Chattancourt',
              countryCode: 'fr',
            },
          });
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('created location is provided in response', () => {
        expect(response.data.location.name).toBe('Chez les beaufs de kevin');
      });

      it('agendaId is not provided in response', () => {
        expect(response.data.location.agendaId).toBeUndefined();
      });
    });

    describe('bad requests', () => {
      it('Wrong route throws 404', async () => {
        const { errorResponse } = await axios({
          method: 'post',
          url: 'http://localhost:3000/17026855/locations',
          headers: {
            'content-type': 'application/json',
          },
          data: {
            access_token: accessToken,
            nonce: 456456789,
            data: {
              name: 'Un lieu',
              address: '15 rue de l\'adresse imaginaire, Trifouifoui',
              countryCode: 'fr',
            },
          },
        }).then(r => ({
          response: r,
        }), e => ({
          errorResponse: e.response,
        }));

        expect(errorResponse.status).toBe(404);
        expect(errorResponse.data.info).toBe('Unhandled route');
      });

      it('Double-encoded JSON throws bad request error', async () => {
        const { errorResponse } = await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/17026855/locations',
          headers: {
            'content-type': 'application/json',
          },
          data: JSON.stringify({
            access_token: accessToken,
            nonce: 898756479,
            data: {
              name: 'Chez les beaufs de kevin',
              address: '12 grande rue, Chattancourt',
              countryCode: 'fr',
            },
          }),
        }).then(r => ({ response: r }), e => ({ errorResponse: e.response }));

        expect(errorResponse.status).toBe(400);
      });
    });

    describe('successful create by contributor', () => {
      let contributorAccessToken;

      beforeAll(async () => {
        contributorAccessToken = await axios({
          method: 'post',
          url: 'http://localhost:3000/requestAccessToken',
          headers: {
            'content-type': 'application/json',
          },
          data: {
            code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
          },
        }).then(r => r.data.access_token);
      });

      beforeAll(async () => {
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/93399464/locations',
            headers: {
              'access-token': contributorAccessToken,
              nonce: 124471456,
              'content-type': 'application/json',
            },
            data: {
              name: 'Marre',
              address: '4 route de Charny, 55100 Marre',
              countryCode: 'fr',
            },
          });
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('successful create by contributor', () => {
        expect(response.status).toBe(200);
      });
    });

    describe('unsuccessful create cause unknowed adress', () => {
      let error;
      beforeAll(async () => {
        try {
          await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/locations',
            headers: {
              'access-token': accessToken,
              nonce: 1231486,
              'content-type': 'application/json',
            },
            data: {
              name: 'Error on address',
              address: 'Route des Bordes, 82110 LAUZERTE',
              countryCode: 'fr',
            },
          });
        } catch (e) {
          // console.log(e.data.response)
          error = e;
        }
      });
      it('test error message', () => {
        expect(error.response.data.message).toBe('geocoder didn\'t find address');
      });
    });

    describe('successful create with an image', () => {
      beforeAll(async () => {
        try {
          fs.copyFileSync(`${__dirname}/fixtures/pirates.jpg`, '/tmp/pirates.jpg');

          const form = new FormData();

          form.append('image', fs.createReadStream('/tmp/pirates.jpg'));
          form.append('access_token', accessToken);
          form.append('nonce', 5784464);
          form.append('data', JSON.stringify({
            name: 'Un lieu avec image',
            address: '12 grande rue, Chattancourt',
            countryCode: 'fr',
          }));

          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/locations',
            headers: form.getHeaders(),
            data: form,
          });
        } catch (e) {
          log('error', e);
        }
      });

      it('image of created location is uploaded', async () => {
        const uploadedHead = await axios.head(response.data.location.image);
        const sinceLastModified = new Date().getTime() - new Date(uploadedHead.headers['last-modified']).getTime();
        expect(sinceLastModified).toBeLessThan(5000);
      });
    });

    describe('successful create with multipart/form-data enc type', () => {
      let createdLocation;

      beforeAll(async () => {
        try {
          const form = new FormData();

          form.append('access_token', accessToken);
          form.append('nonce', 567489456);
          form.append('data', JSON.stringify({
            name: 'Un lieu sans image mais en enctype form-data',
            address: '8 rue Alice, Courbevoie',
            countryCode: 'FR',
          }));

          createdLocation = await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/locations',
            headers: form.getHeaders(),
            data: form,
          });
        } catch (e) {
          // console.log(e);
        }
      });

      it('response contains created location', () => {
        expect(createdLocation.data.location.name).toBe('Un lieu sans image mais en enctype form-data');
      });
    });

    describe('successful update', () => {
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/locations/24505639',
            headers: {
              'access-token': accessToken,
              nonce: 789456,
              'content-type': 'application/json',
            },
            data: {
              name: 'Tournon-sur-Rhône',
              address: 'Place St Julien, 07300 Tournon-sur-Rhône',
              adminLevel4: 'Tournon-sur-Rhône',
              region: 'Auvergne-Rhône-Alpes',
              department: 'Ardèche',
              postalCode: '07300',
              insee: '07324',
              extId: 'ard04',
              countryCode: 'FR',
              latitude: 45.068507,
              longitude: 4.830648,
            },
          });
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('response contains the updated location', () => {
        expect(response.data.location.name).toBe('Tournon-sur-Rhône');
      });
    });

    describe('successful patch', () => {
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'patch',
            url: 'http://localhost:3000/agendas/17026855/locations/24505639',
            headers: {
              'access-token': accessToken,
              nonce: 10111213,
              'content-type': 'application/json',
            },
            data: {
              name: 'Tournon-sur-Rhône patché',
            },
          });
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('response contains the patched location', () => {
        expect(response.data.location.name).toBe('Tournon-sur-Rhône patché');
      });
    });

    describe('successful patch through extId', () => {
      let patchResponse;
      beforeAll(async () => {
        try {
          patchResponse = await axios({
            method: 'patch',
            url: 'http://localhost:3000/agendas/17026855/locations/ext/ard04',
            headers: {
              'access-token': accessToken,
              nonce: 1011883,
              'content-type': 'application/json',
            },
            data: {
              name: 'patché par extId',
            },
          });
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('response code is 200', () => {
        expect(patchResponse.status).toBe(200);
      });

      it('patched data is in response', () => {
        expect(patchResponse.data.location.name).toBe('patché par extId');
      });
    });

    describe('successful get', () => {
      it('location is given using account key', async () => {
        const getResponse = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations/95455142?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          headers: {
            'content-type': 'application/json',
          },
        });

        const {
          location,
        } = getResponse.data;

        expect(location.uid).toBe(95455142);
      });

      it('location is given using access token', async () => {
        const getResponse = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations/95455142',
          headers: {
            'access-token': accessToken,
            nonce: 1014563,
            'content-type': 'application/json',
          },
        });

        const {
          location,
        } = getResponse.data;

        expect(location.uid).toBe(95455142);
      });

      it('location chan be fetched using a slug', async () => {
        const getResponse = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations/slug/cabane-des-eveques?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          headers: {
            'content-type': 'application/json',
          },
        });

        const {
          location,
        } = getResponse.data;

        expect(location.uid).toBe(95455142);
      });

      it('location chan be fetched using an extId', async () => {
        const getResponse = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations/ext/ard04?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          headers: {
            'content-type': 'application/json',
          },
        });

        const {
          location,
        } = getResponse.data;

        expect(location.uid).toBe(24505639);
      });
    });

    describe('successful list', () => {
      let result;
      let allResults;

      beforeAll(async () => {
        allResults = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);

        result = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            limit: 1,
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);
      });

      it('locations are in locations key of response', () => {
        expect(Array.isArray(result.locations)).toBeTruthy();
      });

      it('total is in total key', () => {
        expect(result.total).toBe(allResults.locations.length);
      });

      it('by default, only uid, name, address, latitude longitude and state are provided', () => {
        expect(Object.keys(result.locations[0])).toEqual(
          ['uid', 'name', 'address', 'latitude', 'longitude', 'state'],
        );
      });

      it('detailed option is useful to retrieve all location info', async () => {
        const detailedResults = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            limit: 1,
            detailed: true,
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);

        expect(Object.keys(detailedResults.locations[0])).toEqual(
          [
            'uid', 'setUid', 'slug',
            'name', 'address',
            'countryCode', 'adminLevel1', 'adminLevel2',
            'adminLevel3', 'adminLevel4', 'city', 'adminLevel5', 'adminLevel6', 'district',
            'postalCode', 'insee',
            'latitude', 'longitude', 'region', 'department', 'timezone',
            'updatedAt', 'createdAt', 'image', 'description',
            'tags', 'website', 'email',
            'phone', 'links', 'access',
            'state', 'imageCredits', 'imageRightsAreHeld',
            'extId', 'duplicateCandidates',
            'disqualifiedDuplicates',
            'mergedIn',
          ],
        );
      });

      it('state filter limits result set to requested state', async () => {
        const { locations: verifiedLocations } = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/99501607/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            limit: 1,
            state: 1,
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);

        expect(verifiedLocations.length).toBe(0);
      });

      it('eventCounts option is accessible', async () => {
        const { locations } = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/99501607/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            limit: 1,
            eventCounts: 1,
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);

        expect(locations[0].eventCount).toBe(1);
      });

      it('value provided in after key can be used to fetch next location values', async () => {
        const nextResults = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            limit: 1, // legacy
            after: result.after,
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);

        const locationNames = allResults.locations.map(l => l.name);
        const nextLocationName = locationNames[locationNames.indexOf(result.locations[0].name) + 1];

        expect(nextResults.locations[0].name).toBe(nextLocationName);
      });

      it('from and size can also be used for navigation', async () => {
        const nextResults = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            size: 1,
            from: 2,
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);

        const locationNames = allResults.locations.map(l => l.name);

        expect(nextResults.locations[0].name).toBe(locationNames[2]);
        expect(nextResults.locations.length).toBe(1);
      });

      it('order by name.asc provides ordered locations and an after key', async () => {
        const { locations, after } = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            order: 'name.asc',
          },
          headers: {
            'content-type': 'application/json',
          },
        }).then(r => r?.data);

        expect(locations.map(i => i.name).join(' - ')).toBe(
          locations
            .map(i => i.name)
            .sort((a, b) => a.localeCompare(b))
            .join(' - '),
        );

        expect(after[0]).toBe(locations[locations.length - 1].name);
      });

      it('geo Filter', async () => {
        const geoResults = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            geo: {
              northEast: { lat: '48', lng: '5' },
              southWest: { lat: '44.37', lng: '0.00' },
            },
          },
          headers: {
            'content-type': 'application/json',
          },
          paramsSerializer: params => qs.stringify(params),
        }).then(r => r?.data);

        const noFilterResults = await axios({
          method: 'get',
          url: 'http://localhost:3000/agendas/17026855/locations',
          params: {
            key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          },
          headers: {
            'content-type': 'application/json',
          },
          paramsSerializer: params => qs.stringify(params),
        }).then(r => r?.data);
        expect(geoResults.total).toBeLessThan(noFilterResults.total);
      });
    });

    describe('head', () => {
      it('location is given using account key', async () => {
        const headResponse = await axios({
          method: 'head',
          url: 'http://localhost:3000/agendas/17026855/locations/95455142?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          headers: {
            'content-type': 'application/json',
          },
        });

        expect(headResponse.status).toBe(200);
      });

      it('location is given using access token', async () => {
        const headResponse = await axios({
          method: 'head',
          url: 'http://localhost:3000/agendas/17026855/locations/95455142',
          headers: {
            'access-token': accessToken,
            nonce: 7894548789,
            'content-type': 'application/json',
          },
        });

        expect(headResponse.status).toBe(200);
      });

      it('no location is found', async () => {
        const error = await axios({
          method: 'head',
          url: 'http://localhost:3000/agendas/17026855/locations/456489786456',
          headers: {
            'access-token': accessToken,
            nonce: 10145789,
            'content-type': 'application/json',
          },
        }).catch(e => e);

        expect(error.response.status).toBe(404);
      });
    });

    describe('successful remove', () => {
      let removeResponse;

      beforeAll(async () => {
        try {
          removeResponse = await axios({
            method: 'delete',
            url: 'http://localhost:3000/agendas/17026855/locations/95455142',
            headers: {
              'access-token': accessToken,
              nonce: 7894523,
              'content-type': 'application/json',
            },
          });
        } catch (e) {
          // console.log(e);
        }
      });

      it('response contains the removed location', () => {
        expect(removeResponse.data.location.uid).toBe(95455142);
      });
    });
  });

  describe('sets and interfaces', () => {
    beforeAll(async () => {
      await core.services.agendaLocations.task({
        reset: true,
      });
    });

    afterAll(async () => {
      await core.services.agendaLocations.shutdown({
        reset: true,
      });
    });

    describe('create and update', () => {
      it('a location creation on an agenda linked to a location set also links that location to the set', async () => {
        const created = await core.agendas(55268170).locations.create({
          name: 'Muséonum',
          address: '2 rond-point Madame de Mondonville, Toulouse',
          city: 'Toulouse',
          countryCode: 'FR',
          latitude: 43.641532,
          longitude: 1.450607,
          phone: '0531229417',
        });

        expect(created.setUid).toBe(1);
      });

      it('a location update triggers syncs on all related events and agendas', async () => {
        const promisedStack = new Promise(rs => {
          core.services.tracker.on('eventSearch.update:55268170.55268456', stack => {
            rs(stack);
          });
        });

        core.agendas(55268170).locations.patch(76464022, {
          name: 'Lille Métropole Musée d\'art moderne',
        });

        const stack = await promisedStack;

        expect(_.uniq(stack.filter(s => [
          'agendaLocations.syncImpactedEventsAndAgendas',
          'eventSearch.update:17026855.48564567',
          'eventSearch.update:55268170.55268456',
        ].includes(s))).length).toBe(3);
      });

      it('a location update on a location set can be done from another agenda than the one it originates from', async () => {
        await core.agendas(55278973).locations.patch(97506318, {
          address: '40 rue Richard Lenoir, Paris',
        });

        const location = await core.agendas(55268170).locations.get(97506318);

        expect(location.address).toBe('40 rue Richard Lenoir, Paris');
      });
    });

    describe('removal including linked events', () => {
      beforeAll(() => {
        const promisedTrack = new Promise(rs => {
          core.services.tracker.on('events.onRemove.55268456', rs);
        });

        core.agendas(55268170).locations.remove(76464022, { removeEvents: true });

        return promisedTrack;
      });

      it('a location deletion triggers the deletion of related events', async () => {
        const dbEntry = await core.services.knex('event_2').first('deleted_at').where('uid', 55268456);

        expect(!!dbEntry.deleted_at).toBeTruthy();
      });

      it('legacy entry is also removed', async () => {
        const legacyEntry = await core.services.knex('event').first().where('uid', 55268456);
        expect(legacyEntry).toBeFalsy();
      });
    });

    describe('soft removal', () => {
      beforeAll(async () => {
        await core.agendas(99501607).locations.remove(34566591);

        return new Promise(rs => setTimeout(rs, 2000));
      });

      it('a location soft deletion does not triggers the deletion of related events', async () => {
        const dbEntry = await core.services.knex('event_2').first('deleted_at').where('uid', 20774404);

        expect(dbEntry.deleted_at).toBeFalsy();
      });

      it('legacy entry is not removed', async () => {
        const legacyEntry = await core.services.knex('event').first().where('uid', 20774404);
        expect(legacyEntry).toBeTruthy();
      });
    });
  });
});
