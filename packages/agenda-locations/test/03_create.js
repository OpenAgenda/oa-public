'use strict';

const _ = require('lodash');
const assert = require('assert');
const fs = require('fs');
const redis = require('redis');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');
const Files = require('@openagenda/files');

const payload = require('./fixtures/createData.json');

describe('agenda-locations - functional - create', function() {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      redis: redis.createClient(),
      interfaces: {
        getAgendaDetailsByUid: async (uid, fields = []) => _.pick({
          id: ({
            7196947: 25221
          })[uid],
          locationSetUid: ({
            7196947: 1903810
          })[uid]
        }, fields),
        geocode: async address => [{
          latitude: 47.6576571,
          longitude: -2.7834928,
          department: 'Morbihan',
          region: 'La région',
          city: 'Vannes'
        }]
      },
      Files: Files(dConfig.files)
    });
  });

  describe('defaults', () => {
    let created;

    before(async () => {
      created = await svc(7196947).create(payload);
    });

    it('basic create provides created location as a response', async () => {
      assert.equal(created.name, payload.name);
    });

    it('uid is added during create', () => {
      assert.equal(typeof created.uid, 'number');
    });

    it('slug is added during create', () => {
      assert.equal(typeof created.slug, 'string');
    });

    it('by default state value is 0', () => {
      assert.equal(created.state, 0);
    });

    it('new entry is in db', async () => {
      const entry = await f.client('location').first('placename').where('uid', created.uid);

      assert.equal(entry.placename, created.name);
    });

    it('result does not provide agendaId', () => {
      assert(created.agendaId === undefined);
    });
  });

  describe('set', () => {
    let created;

    before(async () => {
      created = await svc.sets(1903810).locations.create({
        name: 'Bruchon',
        address: 'Bruchon, Lamastre',
        countryCode: 'FR'
      }, { geocodeIfUndefined: true });
    });

    it('created location is associated to set', () => {
      assert.equal(created.setUid, 1903810);
    });

    it('entry has set uid', async () => {
      assert.equal(
        await f.client('location').first('set_uid').where('uid', created.uid).then(r => r.set_uid),
        1903810
      );
    });

    it('location cannot be created if specified set does not exist', async () => {
      try {
        await svc.sets(90389033829).locations.create({
          name: 'Bruchon',
          address: 'Bruchon, Lamastre',
          countryCode: 'FR'
        }, { geocodeIfUndefined: true });
      } catch(e) {
        assert.equal(e.message, 'Not found');
        return;
      }
      throw new Error('Should not reach here');
    });

    it('location created on agendas endpoints and on an agenda associated with set is also associated to set', async () => {
      const created = await svc(7196947).create(payload);
      assert.equal(created.setUid, 1903810);
    });
  });

  describe('with image', function() {
    this.timeout(10000);
    let created;

    before(async () => {
      try {
        created = await svc(7196947).create({
          ...payload,
          image: fs.createReadStream(__dirname + '/fixtures/images/vieilles_pierres.jpg')
        });
      } catch (e) {
        console.log(e);
      }
    });

    it('image filename is referenced in db entry', async () => {
      const entry = await f.client('location').first('store').where('uid', created.uid);

      assert.equal(JSON.parse(entry.store).image, `location${created.uid}.jpg`);
    });
  });

  describe('geocodeIfUndefined', async () => {
    this.timeout(10000);

    let location;

    before(async () => {
      location = await svc(7196947).create({
        name: 'Le Colisée',
        address: '31 rue de l’Epeule Parvis du Colisée, Roubaix',
        countryCode: 'FR'
      }, {
        geocodeIfUndefined: true
      });
    });

    it('latitude and longitude are defined in created location', () => {
      assert.equal(location.latitude, 47.6576571);
      assert.equal(location.longitude, -2.7834928);
    });

    it('insee code is defined if provided by interface', () => {
      assert.equal(location.insee, '56260');
    });
  });

  describe('fixes', async () => {

    it('long name does not trigger an exception due to slug overflow', async () => {

      const l = await svc(7196947).create({
        "name": "Voie gallo-romaine dite voie de Jules César ou chemin de Chartres (également sur communes de Séme...",
        "address": "41160 Membrolles",
        "latitude": "47.996436",
        "longitude": "1.48131",
        "city": "Membrolles",
        "department": "Loir-et-Cher",
        "region": "Centre-Val de Loire",
        "postalCode": "41160",
        "insee": "41173",
        "countryCode": "FR"
      });

    });

  })

});
