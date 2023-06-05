'use strict';

const _ = require('lodash');
const axios = require('axios');

const api = require('../api');
const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('11 - core - functional (server): core.users().agendas.list()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '012.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'queues',
        'bull',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'agendaSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'trackers',
      ],
    });

    core = Core(services, testConfig);

    await services.simpleCache.clearAll();
    await core.agendas.rebuildIndex();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('results contents', () => {
    let result;

    beforeAll(async () => {
      result = await core.users({ uid: 1 }).agendas.list({ limit: 2 });
    });

    it('total, items and after keys are part of results', () => {
      expect(result.total).toBe(4);
      expect(_.isArray(result.items)).toBe(true);
      expect(_.isInteger(result.after)).toBe(true);
    });

    it('items provide agenda details', () => {
      expect(result.items[0].title).toBe('Un agenda thématique');
    });

    it('a member key in each item provide details on member information', () => {
      expect(result.items[0].member).toEqual({
        deletedUser: false,
        name: 'Jan',
        email: null,
        organization: null,
        phone: null,
        position: null,
        role: 'contributor',
        userUid: 1,
      });
    });

    it('detailed option provides more data per item', async () => {
      const {
        items,
      } = await core.users({ uid: 1 }).agendas.list({ limit: 2 }, { detailed: 1 });

      ['summary', 'schema', 'settings'].forEach(field => {
        expect(Object.keys(items[0]).includes(field)).toBe(true);
      });
    });
  });

  describe('navigation', () => {
    const results = [];

    beforeAll(async () => {
      let after = null;
      do {
        const result = await core.users({
          uid: 1,
        }).agendas.list({
          limit: 2,
          after,
        });

        after = result.after;

        results.push(result);
      } while (_.last(results).items.length);
    });

    it('provided after key can be used to fetch next results', () => {
      const titles = results.reduce((carry, { items }) => carry.concat(items.map(item => item.title)), []);

      expect(titles).toEqual([
        'Un agenda thématique',
        'Les Plus Beaux Villages de France',
        "Office de tourisme La Baule - Presqu'île de Guérande",
        'Parc de la Villette',
      ]);
    });

    it('last after is null', () => {
      expect(_.last(results).after).toBeNull();
    });
  });

  describe('api', () => {
    const key = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
    let server;
    let response;

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    describe('successful call', () => {
      beforeAll(async () => {
        response = await axios({
          method: 'get',
          url: `http://localhost:3000/me/agendas?key=${key}`,
        }).then(r => r.data);
      });

      it('response includes a success, total, a list of items and an after key', () => {
        expect(Object.keys(response)).toEqual([
          'total',
          'after',
          'items',
          'success',
        ]);
      });
    });
  });
});
