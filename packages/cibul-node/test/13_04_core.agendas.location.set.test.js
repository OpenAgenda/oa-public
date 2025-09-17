import axios from 'axios';
import Services from '../services/init.js';
import api from '../api/index.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('13 - 03 - core - functional(server): core.agendas().locations.set', () => {
  let core;

  const config = testConfig.extendWith({ queuesPrefix: 'q13_03:' });

  beforeAll(() => loadFixtures(config.db, '023.sql.js'));

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

    await services.simpleCache.clearAll();
  });

  describe('core', () => {
    describe('set new location', () => {
      let createdLocation;
      beforeAll(async () => {
        createdLocation = await core.agendas(64260763).locations.set(
          { extId: { key: 'default', value: 'garedevannes' } },
          {
            name: 'Gare de Vannes',
            address: 'The hell if I know, Vannes',
            countryCode: 'FR',
            latitude: 1,
            longitude: 1,
          },
          {
            autocomplete: false,
          },
        );
      });

      test('location was successfully created', () => {
        expect(createdLocation.extId).toBe('garedevannes');
      });
    });

    describe('set previously existing location', () => {
      let updatedLocation;
      beforeAll(async () => {
        updatedLocation = await core.agendas(64260763).locations.set(
          { extId: { key: 'default', value: 'laBaignoire' } },
          {
            name: 'La Baignoire',
            address: "22 rue de l'ésperence, Roubaix",
            countryCode: 'FR',
            latitude: 1,
            longitude: 1,
          },
          {
            autocomplete: false,
          },
        );
      });

      test('location was successfully updated', () => {
        expect(updatedLocation.address).toBe("22 rue de l'ésperence, Roubaix");
      });
    });
  });

  describe('api', () => {
    let server;
    let adminAccessToken;
    let contributorAccessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      // Get admin access token
      adminAccessToken = await axios({
        method: 'post',
        url: 'http://localhost:4000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL', // admin code
        },
      }).then((r) => r.data.access_token);

      // Get contributor access token
      contributorAccessToken = await axios({
        method: 'post',
        url: 'http://localhost:4000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM', // contributor code
        },
      }).then((r) => r.data.access_token);
    });

    describe('admin permissions', () => {
      describe('set new location', () => {
        let createResponse;
        beforeAll(async () => {
          try {
            createResponse = await axios({
              method: 'put',
              url: 'http://localhost:4000/agendas/1234/locations/ext/gareDeRedon',
              headers: {
                'access-token': adminAccessToken,
                'content-type': 'application/json',
              },
              data: {
                name: 'Gare de Redon',
                address: 'quai de la gare, Redon',
                latitude: 1,
                longitude: 1,
                countryCode: 'FR',
              },
            });
          } catch (e) {
            // console.log(e.response.data.message);
          }
        });
        test('location was successfully created', () => {
          expect(createResponse.data.location.extId).toEqual('gareDeRedon');
        });
      });

      describe('set previously existing location', () => {
        let updateResponse;
        beforeAll(async () => {
          try {
            updateResponse = await axios({
              method: 'put',
              url: 'http://localhost:4000/agendas/1234/locations/ext/laPiscine',
              headers: {
                'access-token': adminAccessToken,
                'content-type': 'application/json',
              },
              data: {
                name: 'La piscine mise à jour',
                address: 'bord de la piscine, Roubaix',
                latitude: 1,
                longitude: 1,
                countryCode: 'FR',
              },
            });
          } catch (e) {
            // console.log(e.response.data.message);
          }
        });

        test('location is updated', () => {
          expect(updateResponse.data.location.name).toBe(
            'La piscine mise à jour',
          );
        });
      });
    });

    describe('contributor permissions', () => {
      describe('can create new location', () => {
        let createResponse;
        beforeAll(async () => {
          try {
            createResponse = await axios({
              method: 'put',
              url: 'http://localhost:4000/agendas/1234/locations/ext/contributorNewLocation',
              headers: {
                'access-token': contributorAccessToken,
                'content-type': 'application/json',
              },
              data: {
                name: 'Contributor Created Location',
                address: 'Created by contributor, Test City',
                latitude: 1,
                longitude: 1,
                countryCode: 'FR',
              },
            });
          } catch (e) {
            createResponse = { error: e.response?.data || e.message };
          }
        });

        test('location was successfully created by contributor', () => {
          expect(createResponse.data.location.extId).toEqual(
            'contributorNewLocation',
          );
          expect(createResponse.data.location.name).toBe(
            'Contributor Created Location',
          );
        });
      });

      describe('cannot update existing location', () => {
        let updateResponse;
        let updateError;
        beforeAll(async () => {
          try {
            // Try to update the location that was created by the admin in the previous test
            updateResponse = await axios({
              method: 'put',
              url: 'http://localhost:4000/agendas/1234/locations/ext/laPiscine',
              headers: {
                'access-token': contributorAccessToken,
                'content-type': 'application/json',
              },
              data: {
                name: 'Contributor Trying to Update',
                address: 'Should not be allowed, Test City',
                latitude: 1,
                longitude: 1,
                countryCode: 'FR',
              },
            });
          } catch (e) {
            updateError = e.response?.data || e.message;
          }
        });

        test('contributor cannot update existing location', () => {
          expect(updateResponse).toBeUndefined();
          expect(updateError).toBeDefined();
          expect(updateError.error).toBe(
            'user is not authorized to perform this operation',
          );
          expect(updateError.operation).toBe('update');
          expect(updateError.userRole).toBe('contributor');
        });
      });
    });
  });
});
