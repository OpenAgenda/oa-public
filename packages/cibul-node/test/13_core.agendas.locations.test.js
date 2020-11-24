'use strict';

const _ = require('lodash');
const axios = require('axios');
const assert = require('assert');
const FormData = require('form-data');
const fs = require('fs');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('13 - core - functional(server): core.agendas().locations.list', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '014.sql'));
  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'tracker',
        'accessTokens',
        'files',
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

    core = Core(services, testConfig);
  });

  afterAll(() => {
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  describe('list', function() {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855
      }).locations.list();
    });

    it('locations are placed in an items key', () => {
      assert.equal(typeof result.items[0].name, 'string');
    });
  });

  describe('create', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855
      }).locations.create({
        name: 'Bar le Richemont',
        address: 'Place de l\'église',
        city: 'Sarzeau',
        countryCode: 'FR'
      });
    });

    it('location is created', () => {
      assert(typeof result.uid === 'number');
    });
  });

  describe('patch', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 17026855
      }).locations.patch(24505639, {
        name: 'Patched location'
      });
    });

    it('the location is patched', () => {
      assert(result.name === 'Patched location');
    });
  });

  describe('remove', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas({
        uid: 9955517
      }).locations.remove(9955517);
    });

    it('location is removed', async () => {
      assert(await testConfig.knex('location').first().where('uid', 9955517) === undefined);
    });
  });

  describe('api', () => {
    let server, accessToken, response;

    beforeAll(done => {
      server = api(core).listen(3000, done);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
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

    describe('successful create', () => {
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/v2/agendas/17026855/locations',
            headers: {
              'access-token': accessToken,
              nonce: 1231456,
              'content-type': 'application/json'
            },
            data: {
              name: 'Chez les beaufs de kevin',
              address: '12 grande rue, Chattancourt',
              countryCode: 'fr'
            }
          });
        } catch (e) {
          console.log(e.response.data);
        }
      });

      it('created location is provided in response', () => {
        assert.equal(response.data.location.name, 'Chez les beaufs de kevin');
      });

      it('agendaId is not provided in response', () => {
        assert.equal(response.data.location.agendaId, undefined);
      });
    });

    describe('successful create with an image', () => {
      beforeAll(async () => {
        try {
          fs.createReadStream(`${__dirname}/fixtures/pirates.jpg`)
            .pipe(fs.createWriteStream('/tmp/pirates.jpg'));

          const form = new FormData();

          form.append('image', fs.createReadStream('/tmp/pirates.jpg'));
          form.append('access_token', accessToken);
          form.append('nonce', 5784464);
          form.append('data', JSON.stringify({
            name: 'Un lieu avec image',
            address: '12 grande rue, Chattancourt',
            countryCode: 'fr'
          }));

          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/v2/agendas/17026855/locations',
            headers: form.getHeaders(),
            data: form
          });
        } catch (e) {
          console.log(e.response.data);
        }
      });

      it('image of created location is uploaded', async () => {
        const uploadedHead = await axios.head(response.data.location.image);
        const sinceLastModified = (new Date).getTime() - (new Date(uploadedHead.headers['last-modified'])).getTime();
        assert(sinceLastModified < 5000);
      });
    });

    describe('successful create with multipart/form-data enc type', () => {
      let response;

      beforeAll(async () => {
        try {
          const form = new FormData();

          form.append('access_token', accessToken);
          form.append('nonce', 567489456);
          form.append('data', JSON.stringify({
            name: 'Un lieu sans image mais en enctype form-data',
            address: '8 rue Alice, Courbevoie',
            countryCode: 'FR'
          }));

          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/v2/agendas/17026855/locations',
            headers: form.getHeaders(),
            data: form
          });
        } catch (e) {
          console.log(e);
        }
      });

      it('response contains created location', () => {
        assert.equal(response.data.location.name, 'Un lieu sans image mais en enctype form-data');
      });
    });

    describe('successful update', () => {
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/v2/agendas/17026855/locations/24505639',
            headers: {
              'access-token': accessToken,
              nonce: 789456,
              'content-type': 'application/json'
            },
            data: {
              name: 'Tournon-sur-Rhône',
              address: 'Place St Julien, 07300 Tournon-sur-Rhône',
              city: 'Tournon-sur-Rhône',
              region: 'Auvergne-Rhône-Alpes',
              department: 'Ardèche',
              postalCode: '07300',
              insee: '07324',
              extId: 'ard04',
              countryCode: 'FR',
              latitude: 45.068507,
              longitude: 4.830648
            }
          });
        } catch (e) {
          console.log(e.response.data);
        }
      });

      it('response contains the updated location', () => {
        assert.equal(response.data.location.name, 'Tournon-sur-Rhône');
      });
    });

    describe('successful patch', () => {
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'patch',
            url: 'http://localhost:3000/v2/agendas/17026855/locations/24505639',
            headers: {
              'access-token': accessToken,
              nonce: 10111213,
              'content-type': 'application/json'
            },
            data: {
              name: 'Tournon-sur-Rhône patché'
            }
          });
        } catch (e) {
          //console.log(e.response.data);
        }
      });

      it('response contains the patched location', () => {
        assert.equal(response.data.location.name, 'Tournon-sur-Rhône patché');
      });
    });

    describe('successful patch through extId', () => {
      let response;
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'patch',
            url: 'http://localhost:3000/v2/agendas/17026855/locations/ext/ard04',
            headers: {
              'access-token': accessToken,
              nonce: 1011883,
              'content-type': 'application/json'
            },
            data: {
              name: 'patché par extId'
            }
          });
        } catch (e) {
          //console.log(e);
          //console.log(e.response.data);
        }
      });

      it('response code is 200', () => {
        assert.equal(response.status, 200);
      });

      it('patched data is in response', () => {
        assert.equal(response.data.location.name, 'patché par extId');
      });
    });

    describe('sucessful get', () => {

      it('location is given using account key', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/v2/agendas/17026855/locations/95455142?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          headers: {
            'content-type': 'application/json'
          }
        });

        const {
          location
        } = response.data;

        assert.equal(location.uid, 95455142);
      });

      it('location is given using access token', async () => {
        const response = await axios({
          method: 'get',
          url: 'http://localhost:3000/v2/agendas/17026855/locations/95455142',
          headers: {
            'access-token': accessToken,
            nonce: 1014563,
            'content-type': 'application/json'
          }
        });

        const {
          location
        } = response.data;

        assert.equal(location.uid, 95455142);
      });

    });

    describe('head', () => {

      it('location is given using account key', async () => {
        const response = await axios({
          method: 'head',
          url: 'http://localhost:3000/v2/agendas/17026855/locations/95455142?key=egP36aMb0toI8hAhFOm1if8auC1Vg1N9',
          headers: {
            'content-type': 'application/json'
          }
        });

        assert.equal(response.status, 200);
      });

      it('location is given using access token', async () => {
        const response = await axios({
          method: 'head',
          url: 'http://localhost:3000/v2/agendas/17026855/locations/95455142',
          headers: {
            'access-token': accessToken,
            nonce: 7894548789,
            'content-type': 'application/json'
          }
        });

        assert.equal(response.status, 200);
      });

      it('no location is found', async () => {
        const error = await axios({
          method: 'head',
          url: 'http://localhost:3000/v2/agendas/17026855/locations/456489786456',
          headers: {
            'access-token': accessToken,
            nonce: 10145789,
            'content-type': 'application/json'
          }
        }).catch(e => e);

        assert.equal(error.response.status, 404);
      });

    });

    describe('successful remove', () => {
      let response;

      beforeAll(async () => {
        try {
          response = await axios({
            method: 'delete',
            url: 'http://localhost:3000/v2/agendas/17026855/locations/95455142',
            headers: {
              'access-token': accessToken,
              nonce: 7894523,
              'content-type': 'application/json'
            }
          });
        } catch (e) {
          console.log(e);
        }
      });

      it('response contains the removed location', () => {
        assert.equal(response.data.location.uid, 95455142);
      });
    });
  });

  describe('sets and interfaces', () => {

    beforeEach(() => {
      core.services.agendaLocations.task({ reset: true });
    });

    afterEach(() => {
      core.services.agendaLocations.task.stop({ reset: true });
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
          phone: '0531229417'
        });

        assert.equal(created.setUid, 1);
      });

      it('a location update triggers syncs on all related events and agendas', done => {
        core.services.tracker.on('eventSearch.update:55268170.55268456', stack => {
          assert.deepEqual(stack, [
            'agendaLocations.syncImpactedEventsAndAgendas',
            'eventSearch.update:17026855.48564567',
            'eventSearch.update:55268170.55268456'
          ]);
          done();
        });

        core.agendas(55268170).locations.patch(76464022, {
          name: 'Lille Métropole Musée d\'art moderne'
        });
      });

    });
    
    describe('removal', () => {

      beforeAll(done => {
        core.services.tracker.on('events.onRemove.55268456', stack => {
          done();
        });

        core.agendas(55268170).locations.remove(76464022);
      })

      it('a location deletion triggers the deletion of related events', async () => {
        const dbEntry = await core.services.knex('event_2').first('deleted_at').where('uid', 55268456);

        assert(!!dbEntry.deleted_at);
      });

      it('legacy entry is also removed', async () => {
        const legacyEntry = await core.services.knex('event').first().where('uid', 55268456);
        assert(!legacyEntry);
      });
    });

    describe('merge', () => {

      beforeAll(() => loadFixtures(testConfig.db, '014.sql'));

      beforeAll(async () => {
        // the merge does not find the locations as they are not listed in the agenda.
        await core.agendas(55268170).locations.merge(76464022, {
          uids: [95155140, 97506318]
        }, {
          name: 'Fusionné'
        });
      });

      it('merge location name is updated', async () => {
        assert.equal(
          await core.services.knex('location').first('placename').where('uid', 76464022).then(r => r.placename),
          'Fusionné'
        );
      });

      it('merged locations have been removed', async () => {
        assert.equal(
          await core.services.knex('location')
            .select('id')
            .whereIn('uid', [95155140, 97506318])
            .then(rows => rows.length),
          0
        );
      });

      it('event linked to merged location has been updated', async () => {
        assert.equal(
          await core.services.knex('event_2')
            .first('location_uid')
            .where('slug', 'que-ferons-nous-de-nos-deserts')
            .then(r => r.location_uid),
          76464022
        );
      });

      it('legacy event reference linked to merged location also has been updated', async () => {
        assert.equal(
          await core.services.knex('event_location')
            .first('location_id')
            .where('event_id', 802994)
            .then(r => r.location_id),
          8
        );
      });

    });

  });

});
