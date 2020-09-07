'use strict';

const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');
const fixtures = require('./fixtures/load');
const Service = require('../');

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
        })[uid]
      }
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
});
