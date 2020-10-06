'use strict';

const _ = require('lodash');
const assert = require('assert');
const fs = require('fs');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('../');
const Files = require('@openagenda/files/v3');

const payload = require('./fixtures/createData.json');

describe('agenda-locations - functional - create', () => {
  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaIdByUid: async uid => ({
          7196947: 25221
        })[uid],
        geocode: async address => [{ latitude: 10, longitude: 11 }]
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
  });

  describe('with image', function() {
    this.timeout(10000);
    let created;

    before(async () => {
      try {
        created = await svc().create({
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

  describe('other', function() {
    this.timeout(10000);

    it('if latitude is not provided at creation and geocodeIfUndefined option is set, a geocoding is made to derive them from address', async () => {
      const created = await svc(7196947).create({
        name: 'Le Colisée',
        address: '31 rue de l’Epeule Parvis du Colisée, Roubaix',
        countryCode: 'FR'
      }, {
        geocodeIfUndefined: true
      });

      assert.equal(created.latitude, 10);
      assert.equal(created.longitude, 11);
    });
  });
});
