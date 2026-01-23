import fs from 'node:fs';
import _ from 'lodash';
import ky from 'ky';
import qs from 'qs';
import logs from '@openagenda/logs';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

const log = logs('13_01');

describe('13 - core - functional(server): core.agendas().locations.list', () => {
  let core;

  const config = testConfig.extendWith({
    queuesPrefix: 'q13_01:',
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_13_01_locations',
    },
  });

  beforeAll(() => loadFixtures(config.db, '014.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'tracker',
        'accessTokens',
        'files',
        'bull',
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
        'users',
        'keys',
      ],
    });

    core = Core(services, config);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(93399464).events.search.rebuild();
    await core.agendas(48353388).events.search.rebuild();
    await core.agendas(17026855).events.search.rebuild();

    core.services.agendaLocations.task({
      reset: true,
      detectDuplicates: false,
    });
    core.services.eventSearch.task({ reset: true });
    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('list', () => {
    let result;

    beforeAll(async () => {
      result = await core
        .agendas({
          uid: 17026855,
        })
        .locations.list();
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
      const { items, total } = await core
        .agendas(17026855)
        .locations.list({ search: '18927679' });

      expect(total).toBe(1);
      expect(items[0].uid).toBe(18927679);
    });

    it('filter to limit results to unverified locations', async () => {
      const { items: unverifiedLocations } = await core
        .agendas(99501607)
        .locations.list({ state: 0 }, { size: 1 });

      const { items: verifiedLocations } = await core
        .agendas(99501607)
        .locations.list({ state: 1 }, { size: 1 });

      expect(unverifiedLocations.length).toEqual(1);
      expect(verifiedLocations.length).toEqual(0);
    });

    it('include event counts in result with option', async () => {
      const { items } = await core.agendas(17026855).locations.list(
        {},
        {},
        {
          eventCounts: true,
        },
      );

      expect(items[0].eventCount).toBe(1);
    });

    it('geo filter', async () => {
      const { items: geoItems } = await core.agendas(17026855).locations.list(
        {
          geo: {
            northEast: { lat: '48', lng: '5' },
            southWest: { lat: '44.37', lng: '4.00' },
          },
        },
        {},
        {},
      );

      const { items } = await core.agendas(17026855).locations.list({}, {}, {});
      expect(items.length).toBeGreaterThan(geoItems.length);
    });
  });

  describe('get', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(17026855).locations.get(95455142, {
        includeLinkedAgendas: true,
      });
    });

    it('get location with option includeLinkedAgendas', () => {
      expect(result.linkedAgendas).toEqual([
        { uid: 17026855, title: 'La Gargouille' },
      ]);
    });

    it('latitude and longitude are numbers not strings', () => {
      expect(typeof result.latitude).toBe('number');
      expect(typeof result.longitude).toBe('number');
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
      result = await core
        .agendas({
          uid: 17026855,
        })
        .locations.create({
          name: 'Bar le Richemont',
          address: "Place de l'église",
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
      await core
        .agendas({
          uid: 17026855,
        })
        .locations.remove(9955517);
    });

    it('location is removed', async () => {
      const location = await config
        .knex('location')
        .first()
        .where('uid', 9955517);
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
        latitude: 44.92872,
        longitude: 2.142774,
        department: 'Tarn',
        region: 'Occitanie',
        postalCode: 81000,
        insee: 81004,
      });

      return new Promise((rs) => {
        core.services.tracker.on('eventSearch.onUpdate.events', rs);
      });
    });

    it('related events have their location data updated', async () => {
      const { events } = await core
        .agendas(48353388)
        .events.search({}, { size: 1 }, { detailed: true });

      expect(events[0].location.name).toBe('Lautrec');
    });
  });

  describe('api', () => {
    let server;
    let accessToken;
    let response;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const tokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    describe('successful create by administrator', () => {
      beforeAll(async () => {
        try {
          response = await ky
            .post('http://localhost:4000/agendas/17026855/locations', {
              headers: {
                'access-token': accessToken,
              },
              json: {
                name: 'Chez les beaufs de kevin',
                address: '12 grande rue, Chattancourt',
                countryCode: 'fr',
              },
            })
            .json();
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('created location is provided in response', () => {
        expect(response.location.name).toBe('Chez les beaufs de kevin');
      });

      it('agendaId is not provided in response', () => {
        expect(response.location.agendaId).toBeUndefined();
      });

      it('has fetched adminLevels', () => {
        expect(response.location.adminLevel1).toBe('Grand Est');
      });
      it('tz', () => {
        expect(response.location.timezone).toBe('Europe/Paris');
      });
    });

    describe('bad requests', () => {
      it('Wrong route throws 404', async () => {
        const errorResponse = await ky
          .post('http://localhost:4000/17026855/locations', {
            json: {
              access_token: accessToken,
              data: {
                name: 'Un lieu',
                address: "15 rue de l'adresse imaginaire, Trifouifoui",
                countryCode: 'fr',
              },
            },
          })
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        expect(errorResponse.status).toBe(404);
        const errorData = await errorResponse.json();
        expect(errorData.info).toBe('Unhandled route');
      });

      it('Double-encoded JSON throws bad request error', async () => {
        const errorResponse = await ky
          .post('http://localhost:4000/agendas/17026855/locations', {
            body: JSON.stringify(
              JSON.stringify({
                access_token: accessToken,
                data: {
                  name: 'Chez les beaufs de kevin',
                  address: '12 grande rue, Chattancourt',
                  countryCode: 'fr',
                },
              }),
            ),
            headers: {
              'content-type': 'application/json',
            },
          })
          .json()
          .then(
            () => {},
            (err) => err.response,
          );
        expect(errorResponse.status).toBe(400);
      });
    });

    describe('successful create by contributor', () => {
      let contributorAccessToken;

      beforeAll(async () => {
        const contributorTokenResponse = await ky
          .post('http://localhost:4000/requestAccessToken', {
            json: {
              code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
            },
          })
          .json();
        contributorAccessToken = contributorTokenResponse.access_token;
      });

      beforeAll(async () => {
        try {
          response = await ky
            .post('http://localhost:4000/agendas/93399464/locations', {
              headers: {
                'access-token': contributorAccessToken,
              },
              json: {
                name: 'Marre',
                address: '4 route de Charny, 55100 Marre',
                countryCode: 'fr',
              },
            })
            .json();
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('successful create by contributor', () => {
        expect(response).toBeDefined();
      });
    });

    describe('unsuccessful create cause unknowed adress', () => {
      let error;
      beforeAll(async () => {
        error = await ky
          .post('http://localhost:4000/agendas/17026855/locations', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              name: 'Error on address',
              address: 'Route des Bordes, 82110 LAUZERTE',
              countryCode: 'fr',
            },
          })
          .json()
          .then(
            () => {},
            (err) => err,
          );
      });
      it('test error message', async () => {
        const errorData = await error.response.json();
        expect(errorData.message).toBe("geocoder didn't find address");
      });
    });

    describe('unsuccessful create cause extId too long', () => {
      let error;
      beforeAll(async () => {
        error = await ky
          .post('http://localhost:4000/agendas/17026855/locations', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              name: 'Marre',
              address: '4 route de Charny, 55100 Marre',
              countryCode: 'fr',
              extId:
                'hggdjsfhgiygUEYGFDUQGYZDzhbqhsdbqhsdshqbdsqhgdsjqdhgqhjgdqjhdgsqdhggdjsfhgiygUEYGFDUQGYZDzhbqhsdbqhsdshqbdsqhgdsjqdhgqhjgdqjhdgsqdhggdjsfhgiygUEYGFDUQGYZDzhbqhsdbqhsdshqbdsqhgdsjqdhgqhjgdqjhdgsqd',
            },
          })
          .json()
          .then(
            () => {},
            (err) => err,
          );
      });
      it('test error message', async () => {
        const errorData = await error.response.json();
        expect(errorData.message).toBe('data is invalid');
      });
    });

    describe('successful create with an image', () => {
      beforeAll(async () => {
        try {
          fs.copyFileSync(
            `${import.meta.dirname}/fixtures/pirates.jpg`,
            '/tmp/pirates.jpg',
          );

          const form = new FormData();

          form.append(
            'image',
            await fs.openAsBlob('/tmp/pirates.jpg'),
            'pirates.jpg',
          );
          form.append('access_token', accessToken);
          form.append(
            'data',
            JSON.stringify({
              name: 'Un lieu avec image',
              address: '12 grande rue, Chattancourt',
              countryCode: 'fr',
            }),
          );

          response = await ky
            .post('http://localhost:4000/agendas/17026855/locations', {
              body: form,
            })
            .json();
        } catch (e) {
          log('error', e);
        }
      });

      it('image of created location is uploaded', async () => {
        const uploadedHead = await ky.head(response.location.image);
        const sinceLastModified = new Date().getTime()
          - new Date(uploadedHead.headers.get('last-modified')).getTime();
        expect(sinceLastModified).toBeLessThan(5000);
      });
    });

    describe('successful create with multipart/form-data enc type', () => {
      let createdLocation;

      beforeAll(async () => {
        try {
          const form = new FormData();

          form.append('access_token', accessToken);
          form.append(
            'data',
            JSON.stringify({
              name: 'Un lieu sans image mais en enctype form-data',
              address: '8 rue Alice, Courbevoie',
              countryCode: 'FR',
            }),
          );

          createdLocation = await ky
            .post('http://localhost:4000/agendas/17026855/locations', {
              body: form,
            })
            .json();
        } catch (e) {
          // console.log(e);
        }
      });

      it('response contains created location', () => {
        expect(createdLocation.location.name).toBe(
          'Un lieu sans image mais en enctype form-data',
        );
      });
    });

    describe('successful create with emojis in description', () => {
      let emojiLocation;

      beforeAll(async () => {
        try {
          emojiLocation = await ky
            .post('http://localhost:4000/agendas/17026855/locations', {
              headers: {
                'access-token': accessToken,
              },
              json: {
                name: 'Le Café des Arts',
                description:
                  'Un lieu chaleureux avec de la musique 🎵 et de bons moments 🎉',
                address: '12 rue de la Paix, Paris',
                countryCode: 'FR',
              },
            })
            .json();
        } catch (e) {
          console.log(e);
        }
      });

      it('location is created successfully', () => {
        expect(typeof emojiLocation.location.uid).toBe('number');
      });

      it('emojis are preserved in description', () => {
        expect(emojiLocation.location.description.en).toBe(
          'Un lieu chaleureux avec de la musique 🎵 et de bons moments 🎉',
        );
      });
    });

    describe('unsuccessful create with emoji in name', () => {
      let error;

      beforeAll(async () => {
        error = await ky
          .post('http://localhost:4000/agendas/17026855/locations', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              name: 'Le Café ☕️ des Arts',
              address: '12 rue de la Paix, Paris',
              countryCode: 'FR',
            },
          })
          .json()
          .then(
            () => {},
            (err) => err,
          );
      });

      it('throws an error', () => {
        expect(error).toBeDefined();
        expect(error.response.status).toBe(400);
      });

      it('error indicates invalid data', async () => {
        const errorData = await error.response.json();
        expect(errorData.message).toBe('data is invalid');
      });
    });

    describe('put by extId', () => {
      let createResp = null;
      let updateResp = null;
      beforeAll(async () => {
        try {
          createResp = await ky
            .put('http://localhost:4000/agendas/17026855/locations/ext/ard44', {
              headers: {
                'access-token': accessToken,
              },
              json: {
                name: 'Tournon-sur-Rhône',
                address: 'Place St Julien, 07300 Tournon-sur-Rhône',
                adminLevel4: 'Tournon-sur-Rhône',
                region: 'Auvergne-Rhône-Alpes',
                department: 'Ardèche',
                postalCode: '07300',
                insee: '07324',
                countryCode: 'FR',
                latitude: 45.068507,
                longitude: 4.830648,
              },
            })
            .json();
        } catch (error) {
          // console.log('create error', error);
        }

        try {
          updateResp = await ky
            .put('http://localhost:4000/agendas/17026855/locations/ext/ard44', {
              headers: {
                'access-token': accessToken,
              },
              json: {
                name: 'Tournon-sur-Rhône Updated',
              },
            })
            .json();
        } catch (error) {
          // console.log('update error', error.response.data)
        }
      });
      it('successful create', () => {
        expect(createResp.location.extId).toBe('ard44');
        expect(createResp.location.extIds).toStrictEqual([
          { key: 'default', value: 'ard44' },
        ]);
      });
      it('successfull update', () => {
        expect(updateResp.location.uid).toBe(createResp.location.uid);
        expect(updateResp.location.name).toBe('Tournon-sur-Rhône Updated');
        expect(updateResp.location.extId).toBe('ard44');
        expect(updateResp.location.extIds).toStrictEqual([
          { key: 'default', value: 'ard44' },
        ]);
      });
    });

    describe('successful update', () => {
      beforeAll(async () => {
        try {
          response = await ky
            .post('http://localhost:4000/agendas/17026855/locations/24505639', {
              headers: {
                'access-token': accessToken,
              },
              json: {
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
            })
            .json();
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('response contains the updated location', () => {
        expect(response.location.name).toBe('Tournon-sur-Rhône');
      });

      it('extId set in extId and extIds keys', () => {
        expect(response.location.extId).toBe('ard04');
        expect(response.location.extIds).toStrictEqual([
          { key: 'default', value: 'ard04' },
          { key: 'test', value: 'qs2' },
        ]);
      });
    });

    describe('successful patch', () => {
      beforeAll(async () => {
        try {
          response = await ky
            .patch(
              'http://localhost:4000/agendas/17026855/locations/24505639',
              {
                headers: {
                  'access-token': accessToken,
                },
                json: {
                  name: 'Tournon-sur-Rhône patché',
                },
              },
            )
            .json();
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('response contains the patched location', () => {
        expect(response.location.name).toBe('Tournon-sur-Rhône patché');
      });
    });

    describe('successful patch through extId', () => {
      let patchResponse;
      beforeAll(async () => {
        try {
          patchResponse = await ky
            .patch(
              'http://localhost:4000/agendas/17026855/locations/ext/ard02',
              {
                headers: {
                  'access-token': accessToken,
                },
                json: {
                  name: 'patché par extId',
                },
              },
            )
            .json();
        } catch (e) {
          console.log(e.response.data);
        }
      });

      it('response code is 200', () => {
        expect(patchResponse).toBeDefined();
      });

      it('patched data is in response', () => {
        expect(patchResponse.location.name).toBe('patché par extId');
      });
    });

    describe('successful get', () => {
      it('location is given using account key', async () => {
        const getResponse = await ky
          .get(
            'http://localhost:4000/agendas/17026855/locations/95455142?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          )
          .json();

        const { location } = getResponse;

        expect(location.uid).toBe(95455142);
      });

      it('location is given using access token', async () => {
        const getResponse = await ky
          .get('http://localhost:4000/agendas/17026855/locations/95455142', {
            headers: {
              'access-token': accessToken,
            },
          })
          .json();

        const { location } = getResponse;

        expect(location.uid).toBe(95455142);
      });

      it('location chan be fetched using a slug', async () => {
        const getResponse = await ky
          .get(
            'http://localhost:4000/agendas/17026855/locations/slug/cabane-des-eveques?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          )
          .json();

        const { location } = getResponse;

        expect(location.uid).toBe(95455142);
      });

      it('location can be fetched using an default extId with value', async () => {
        const getResponse = await ky
          .get(
            'http://localhost:4000/agendas/17026855/locations/ext/ard02?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          )
          .json();

        const { location } = getResponse;

        expect(location.uid).toBe(42197191);
      });

      it('location chan be fetched using an extId whit key and value', async () => {
        const getResponse = await ky
          .get(
            'http://localhost:4000/agendas/17026855/locations/ext/default/ard02?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          )
          .json();

        const { location } = getResponse;

        expect(location.uid).toBe(42197191);
      });

      it('latitude and longitude are numbers not strings', async () => {
        const getResponse = await ky
          .get('http://localhost:4000/agendas/17026855/locations/95455142', {
            headers: {
              'access-token': accessToken,
            },
          })
          .json();

        const { location } = getResponse;

        expect(typeof location.latitude).toBe('number');
        expect(typeof location.longitude).toBe('number');
      });
    });

    describe('successful list', () => {
      let result;
      let allResults;

      beforeAll(async () => {
        allResults = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            },
          })
          .json();

        result = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              limit: 1,
            },
          })
          .json();
      });

      it('locations are in locations key of response', () => {
        expect(Array.isArray(result.locations)).toBeTruthy();
      });

      it('total is in total key', () => {
        expect(result.total).toBe(allResults.locations.length);
      });

      it('by default, only uid, name, address, latitude longitude and state are provided', () => {
        expect(Object.keys(result.locations[0])).toEqual([
          'uid',
          'name',
          'address',
          'latitude',
          'longitude',
          'state',
        ]);
      });

      it('detailed option is useful to retrieve all location info', async () => {
        const detailedResults = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              limit: 1,
              detailed: true,
            },
          })
          .json();

        expect(Object.keys(detailedResults.locations[0])).toEqual([
          'uid',
          'setUid',
          'slug',
          'name',
          'address',
          'countryCode',
          'adminLevel1',
          'adminLevel2',
          'adminLevel3',
          'adminLevel4',
          'city',
          'adminLevel5',
          'adminLevel6',
          'district',
          'postalCode',
          'insee',
          'latitude',
          'longitude',
          'region',
          'department',
          'timezone',
          'updatedAt',
          'createdAt',
          'image',
          'description',
          'tags',
          'website',
          'email',
          'phone',
          'links',
          'access',
          'state',
          'imageCredits',
          'imageRightsAreHeld',
          'extIds',
          'duplicateCandidates',
          'disqualifiedDuplicates',
          'mergedIn',
          'extId',
        ]);
      });

      it('state filter limits result set to requested state', async () => {
        const { locations: verifiedLocations } = await ky
          .get('http://localhost:4000/agendas/99501607/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              limit: 1,
              state: 1,
            },
          })
          .json();

        expect(verifiedLocations.length).toBe(0);
      });

      it('eventCounts option is accessible', async () => {
        const { locations } = await ky
          .get('http://localhost:4000/agendas/99501607/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              limit: 1,
              eventCounts: 1,
            },
          })
          .json();

        expect(locations[0].eventCount).toBe(1);
      });

      it('value provided in after key can be used to fetch next location values', async () => {
        const nextResults = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              limit: 1, // legacy
              after: result.after,
            },
          })
          .json();

        const locationNames = allResults.locations.map((l) => l.name);
        const nextLocationName = locationNames[locationNames.indexOf(result.locations[0].name) + 1];

        expect(nextResults.locations[0].name).toBe(nextLocationName);
      });

      it('from and size can also be used for navigation', async () => {
        const nextResults = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              size: 1,
              from: 2,
            },
          })
          .json();

        const locationNames = allResults.locations.map((l) => l.name);

        expect(nextResults.locations[0].name).toBe(locationNames[2]);
        expect(nextResults.locations.length).toBe(1);
      });

      it('order by name.asc provides ordered locations and an after key', async () => {
        const { locations, after } = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              order: 'name.asc',
            },
          })
          .json();

        expect(locations.map((i) => i.name).join(' - ')).toBe(
          locations
            .map((i) => i.name)
            .sort((a, b) => a.localeCompare(b))
            .join(' - '),
        );

        expect(after[0]).toBe(locations[locations.length - 1].name);
      });

      it('geo Filter', async () => {
        const geoParams = qs.stringify({
          key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          geo: {
            northEast: { lat: '48', lng: '5' },
            southWest: { lat: '44.37', lng: '0.00' },
          },
        });
        const geoResults = await ky
          .get(`http://localhost:4000/agendas/17026855/locations?${geoParams}`)
          .json();

        const noFilterResults = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
            },
          })
          .json();
        expect(geoResults.total).toBeLessThan(noFilterResults.total);
      });

      it('hasNull malformed filter with detailed and eventCounts options', async () => {
        const { locations, total } = await ky
          .get('http://localhost:4000/agendas/17026855/locations', {
            searchParams: {
              key: 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
              detailed: 1,
              eventCounts: 1,
              page: 1,
              from: 0,
              size: 20,
              hasNull: 'adminLevel1,adminLevel2',
            },
          })
          .json();

        expect(Array.isArray(locations)).toBeTruthy();
        expect(typeof total).toBe('number');

        locations.forEach((location) => {
          expect(location.adminLevel1).toBeNull();
          expect(location.adminLevel2).toBeNull();

          expect(Object.keys(location).length).toBeGreaterThan(6);
          expect(location).toHaveProperty('countryCode');
          expect(location).toHaveProperty('timezone');
          expect(location).toHaveProperty('eventCount');
        });
      });
    });

    describe('head', () => {
      it('location is given using account key', async () => {
        const headResponse = await ky.head(
          'http://localhost:4000/agendas/17026855/locations/95455142?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
        );

        expect(headResponse.status).toBe(200);
      });

      it('location is given using access token', async () => {
        const headResponse = await ky.head(
          'http://localhost:4000/agendas/17026855/locations/95455142',
          {
            headers: {
              'access-token': accessToken,
            },
          },
        );

        expect(headResponse.status).toBe(200);
      });

      it('no location is found', async () => {
        const error = await ky
          .head(
            'http://localhost:4000/agendas/17026855/locations/456489786456',
            {
              headers: {
                'access-token': accessToken,
              },
            },
          )
          .catch((e) => e);

        expect(error.response.status).toBe(404);
      });
    });

    describe('successful remove', () => {
      let removeResponse;

      beforeAll(async () => {
        try {
          removeResponse = await ky
            .delete(
              'http://localhost:4000/agendas/17026855/locations/95455142',
              {
                headers: {
                  'access-token': accessToken,
                },
              },
            )
            .json();
        } catch (e) {
          // console.log(e);
        }
      });

      it('response contains the removed location', () => {
        expect(removeResponse.location.uid).toBe(95455142);
      });
    });

    describe('fix create because name is too long', () => {
      let error;
      beforeAll(async () => {
        error = await ky
          .post('http://localhost:4000/agendas/17026855/locations', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              name: 'Boulevard de Yougoslavie, Parc des Hautes Ourmes, Jardin Slovène, Square de Galicie, Parc de Landry, square de Sétubal',
              address: '2 Boulevard de Yougoslavie, Rennes, France',
              countryCode: 'fr',
            },
          })
          .json()
          .then(
            () => {},
            (err) => err,
          );
      });
      it('test error message', async () => {
        const errorData = await error.response.json();
        expect(errorData.errors[0].code).toBe('string.toolong');
        expect(errorData.message).toBe('data is invalid');
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
        const promisedStack = new Promise((rs) => {
          core.services.tracker.on(
            'eventSearch.update:55268170.55268456',
            (stack) => {
              rs(stack);
            },
          );
        });

        core.agendas(55268170).locations.patch(76464022, {
          name: "Lille Métropole Musée d'art moderne",
        });

        const stack = await promisedStack;

        expect(
          _.uniq(
            stack.filter((s) =>
              [
                'agendaLocations.syncImpactedEventsAndAgendas',
                'eventSearch.update:17026855.48564567',
                'eventSearch.update:55268170.55268456',
              ].includes(s)),
          ).length,
        ).toBe(3);
      });

      it('a location update on a location set can be done from another agenda than the one it originates from', async () => {
        await core.agendas(55278973).locations.patch(97506318, {
          address: '40 rue Richard Lenoir, Paris',
        });

        const location = await core.agendas(55268170).locations.get(97506318);

        expect(location.address).toBe('40 rue Richard Lenoir, Paris');
      });

      it('fix extId too long for index', async () => {
        let err;
        try {
          await core
            .agendas(55268170)
            .locations.create(
              JSON.parse(
                '{"extId":"EitQbC4gSG9ub3LDqSBDb21tZXVyZWMsIDM1MDAwIFJlbm5lcywgRnJhbmNlIi4qLAoUChIJvxmyqDTeDkgRBO2KWK-eA0cSFAoS","name":"La Criée Marché Central","address":"Place Honoré Commeurec 35000 Rennes","city":"Rennes","postalCode":"35000","countryCode":"FR","latitude":48.10831839999999,"longitude":-1.6796329}',
              ),
            );
        } catch (error) {
          err = error;
        }
        expect(err).toBeUndefined();
      });
    });

    describe('removal including linked events', () => {
      beforeAll(() => {
        const promisedTrack = new Promise((rs) => {
          core.services.tracker.on('events.onRemove.55268456', rs);
        });

        core
          .agendas(55268170)
          .locations.remove(76464022, { removeEvents: true });

        return promisedTrack;
      });

      it('a location deletion triggers the deletion of related events', async () => {
        const dbEntry = await core.services
          .knex('event_2')
          .first('deleted_at')
          .where('uid', 55268456);

        expect(!!dbEntry.deleted_at).toBeTruthy();
      });
    });

    describe('soft removal', () => {
      beforeAll(async () => {
        await core.agendas(99501607).locations.remove(34566591);

        return new Promise((rs) => setTimeout(rs, 2000));
      });

      it('a location soft deletion does not triggers the deletion of related events', async () => {
        const dbEntry = await core.services
          .knex('event_2')
          .first('deleted_at')
          .where('uid', 20774404);

        expect(dbEntry.deleted_at).toBeFalsy();
      });
    });
  });
});
