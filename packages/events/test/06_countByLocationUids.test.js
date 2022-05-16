'use strict';

const assert = require('assert');

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');

describe('events - functional - countByLocationUids', () => {
  const f = fixtures(config.mysql, config.schema);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: config.imagePath,
      defaultImage: '//default/image/path.png'
    });
  });

  describe('simple count', () => {
    let counts;

    beforeAll(async () => {
      counts = await svc.countByLocationUids({ locationUid: [34342835, 4395371, 43953713] }, { private: false });
    });

    it('lists 20 items by default', () => {
      assert.equal(counts.length, 2);
    });

  });
});