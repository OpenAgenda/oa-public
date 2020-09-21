'use strict';

const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');
const fixtures = require('./fixtures');
const Service = require('../');

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

  let removed;

  before(async () => {
    removed = await svc(7196947).remove(95301591);
  });

  it('remove provides removed location in response', () => {
    assert.equal(removed.uid, 95301591);
  });

  it('removed location is no longer present in db', async () => {
    const entry = await f.client('location').first().where('uid', removed.uid);

    assert.ok(entry === undefined);
  });

});
