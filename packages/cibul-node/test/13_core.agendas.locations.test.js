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
const fixtures = require('./fixtures/014.sql');

const api = require('../api');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('13 - core - functional(server): core.agendas().locations.list', function() {
  let core;

  beforeAll(async () => {
    const con = mysql.createConnection(Object.assign( _.pick(testConfig.db, [
      'user',
      'password',
      'host',
      'ssl'
    ]), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
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
        'keys',
        'trackers'
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

});
