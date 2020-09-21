'use strict';

const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');
const fixtures = require('./fixtures');
const Service = require('../');

const payload = require('./fixtures/updateData.json');

describe('agenda-locations - functional - update', () => {
  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getAgendaIdByUid: async uid => ({
          7196947: 25221
        })[uid]
      }
    });
  });

  describe('default update', () => {
    let updated;

    before(async () => {
      updated = await svc(7196947).update(95301591, payload);
    });

    it('basic update provides updated location as a response', async () => {
      assert.equal(updated.name, payload.name);
    });
  });

  describe('default patch', () => {
    let patched;
    const entry = {};

    before(async () => {
      entry.before = await f.client('location').first().where('uid', 89634707);

      patched = await svc(7196947).patch(89634707, {
        name: 'Patched name'
      });
      entry.after = await f.client('location').first().where('uid', 89634707);
    });

    it('basic patch only affects provided fields', () => {
      assert.equal(entry.after.placename, 'Patched name');
      assert.equal(entry.after.address, 'Rue du château, 07570 Désaignes');
    });

    it('updatedAt is updated', async () => {
      assert.notEqual(JSON.stringify(entry.before.updated_at), JSON.stringify(entry.after.updated_at));
    });
  });

  describe('other', () => {

    it('uid cannot be modified through update', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1
      });

      assert.equal(updated.uid, 95301591);
    });

    it('uid cannot be modified through patch', async () => {
      const updated = await svc(7196947).update(95301591, {
        ...payload,
        uid: 1
      });

      assert.equal(updated.uid, 95301591);
    });

  });
});
