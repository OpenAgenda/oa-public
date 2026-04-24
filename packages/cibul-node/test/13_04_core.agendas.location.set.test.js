import ky from 'ky';
import Services from '../services/init.js';
import api from '../api/index.js';
import Core from '../core/index.js';
import setup from './fixtures/setup.js';
import testConfig from './testConfig.js';

const enabled = [
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
];

describe('13 - 03 - core - functional(server): core.agendas().locations.set', () => {
  let core;

  const config = testConfig.extendWith({ queuesPrefix: 'q13_03:' });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['023.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

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
      const adminTokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhL', // admin code
          },
        })
        .json();
      adminAccessToken = adminTokenResponse.access_token;

      // Get contributor access token
      const contributorTokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM', // contributor code
          },
        })
        .json();
      contributorAccessToken = contributorTokenResponse.access_token;
    });

    describe('admin permissions', () => {
      describe('set new location', () => {
        let createResponse;
        beforeAll(async () => {
          try {
            createResponse = await ky
              .put(
                'http://localhost:4000/agendas/1234/locations/ext/gareDeRedon',
                {
                  headers: {
                    'access-token': adminAccessToken,
                  },
                  json: {
                    name: 'Gare de Redon',
                    address: 'quai de la gare, Redon',
                    latitude: 1,
                    longitude: 1,
                    countryCode: 'FR',
                  },
                },
              )
              .json();
          } catch (e) {
            // console.log(e.response.data.message);
          }
        });
        test('location was successfully created', () => {
          expect(createResponse.location.extId).toEqual('gareDeRedon');
        });
      });

      describe('set previously existing location', () => {
        let updateResponse;
        beforeAll(async () => {
          try {
            updateResponse = await ky
              .put(
                'http://localhost:4000/agendas/1234/locations/ext/laPiscine',
                {
                  headers: {
                    'access-token': adminAccessToken,
                  },
                  json: {
                    name: 'La piscine mise à jour',
                    address: 'bord de la piscine, Roubaix',
                    latitude: 1,
                    longitude: 1,
                    countryCode: 'FR',
                  },
                },
              )
              .json();
          } catch (e) {
            // console.log(e.response.data.message);
          }
        });

        test('location is updated', () => {
          expect(updateResponse.location.name).toBe('La piscine mise à jour');
        });
      });
    });

    describe('contributor permissions', () => {
      describe('can create new location', () => {
        let createResponse;
        beforeAll(async () => {
          try {
            createResponse = await ky
              .put(
                'http://localhost:4000/agendas/1234/locations/ext/contributorNewLocation',
                {
                  headers: {
                    'access-token': contributorAccessToken,
                  },
                  json: {
                    name: 'Contributor Created Location',
                    address: 'Created by contributor, Test City',
                    latitude: 1,
                    longitude: 1,
                    countryCode: 'FR',
                  },
                },
              )
              .json();
          } catch (e) {
            const errorData = await e.response
              ?.json()
              .catch(() => ({ message: e.message }));
            createResponse = { error: errorData || e.message };
          }
        });

        test('location was successfully created by contributor', () => {
          expect(createResponse.location.extId).toEqual(
            'contributorNewLocation',
          );
          expect(createResponse.location.name).toBe(
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
            updateResponse = await ky
              .put(
                'http://localhost:4000/agendas/1234/locations/ext/laPiscine',
                {
                  headers: {
                    'access-token': contributorAccessToken,
                  },
                  json: {
                    name: 'Contributor Trying to Update',
                    address: 'Should not be allowed, Test City',
                    latitude: 1,
                    longitude: 1,
                    countryCode: 'FR',
                  },
                },
              )
              .json();
          } catch (e) {
            updateError = await e.response?.json().catch(() => e.message);
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
