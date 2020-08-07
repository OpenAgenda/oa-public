"use strict";

const _ = require('lodash');
const assert = require('assert');
const { promisify } = require('util');

const insee = require('../utils/insee');
const distance = require('../utils/distance');
const decorateWithCounts = require('../bisounours/lib/decorateWithCounts');

const redisConfig = { host: 'localhost', port: 6379 };

const ns = 'insee';

const redisCli = require('redis').createClient(redisConfig.port, redisConfig.host);

const rcHGet = promisify(redisCli.hget.bind(redisCli));

describe('utils', () => {

  describe('decorateWithCounts', () => {

    it('adds given counts to matching location', () => {
      const locations = [{
        uid: 111,
        name: 'Le Monop'
      }, {
        uid: 112,
        name: 'Le Prisu'
      }];

      decorateWithCounts(locations, [{
        uid: 112,
        agendaEventCount: 12,
        eventCount: 24
      }]);

      assert.deepEqual(locations, [{
        uid: 111,
        name: 'Le Monop',
        eventCount: 0,
        agendaEventCount: 0
      }, {
        uid: 112,
        name: 'Le Prisu',
        agendaEventCount: 12,
        eventCount: 24
      }]);
    });

  });

  describe('insee', () => {

    before(() => {
      insee.init({ redis: redisConfig });
    });

    beforeEach(done => {
      // clear redis key
      redisCli.del(ns, done);
    });

    it('retrieves insee reference', async () => {
      const ref = await insee({
        city: 'Lamastre', // for caching
        department: 'Ardèche', // for caching (name might be not enough)
        latitude: 44.9870015,
        longitude: 4.5737007
      });

      assert.equal(ref, '07129');
    });

    it('caches reference in redis', async () => {
      const before = await rcHGet(ns, 'ardeche|lamastre');

      assert.equal(before, null);

      await insee({
        city: 'Lamastre',
        department: 'Ardèche',
        latitude: 44.9870015,
        longitude: 4.5737007
      });

      const after = await rcHGet(ns, 'ardeche|lamastre');

      assert.deepEqual(
        _.pick(_.first(JSON.parse(after)), [ 'nom', 'code' ]),
        { nom: 'Lamastre', code: '07129' }
      );
    });

    it('uses cache at second call', async () => {
      await insee({
        city: 'Lamastre',
        department: 'Ardèche',
        latitude: 44.9870015,
        longitude: 4.5737007
      });

      assert.equal(insee.fromCache, false);

      await insee({
        city: 'Lamastre',
        department: 'Ardèche',
        latitude: 44.9870015,
        longitude: 4.5737007
      });

      assert.equal(insee.fromCache, true);
    });

  });

  describe('distance', () => {

    it('gets the distance in meters', () => {
      const d = distance({
        name: 'La boutique',
        latitude: 48.867622,
        longitude: 2.352210
      }, {
        name: 'La Gaité Lyrique',
        latitude: 48.866771,
        longitude: 2.353651
      });

      assert.equal(d, 142);
    });

  });

});
