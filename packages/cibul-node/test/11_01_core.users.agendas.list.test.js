import _ from 'lodash';
import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('11 - core - functional (server): core.users().agendas.list()', () => {
  let core;

  const config = testConfig.extendWith({
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_users_agendas_list',
    },
  });

  beforeAll(() => loadFixtures(config.db, '012.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
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
        'users',
        'keys',
        'trackers',
      ],
    });

    core = Core(services, config);

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();
    await core.agendas(1).events.search.rebuild();
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
      const { items } = await core
        .users({ uid: 1 })
        .agendas.list({ limit: 2 }, { detailed: 1 });

      ['summary', 'schema', 'settings'].forEach((field) => {
        expect(Object.keys(items[0]).includes(field)).toBe(true);
      });
    });
  });

  describe('navigation', () => {
    const results = [];

    beforeAll(async () => {
      let after = null;
      do {
        const result = await core
          .users({
            uid: 1,
          })
          .agendas.list({
            limit: 2,
            after,
          });

        after = result.after;

        results.push(result);
      } while (_.last(results).items.length);
    });

    it('provided after key can be used to fetch next results', () => {
      const titles = results.reduce(
        (carry, { items }) => carry.concat(items.map((item) => item.title)),
        [],
      );

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
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    describe('successful call', () => {
      beforeAll(async () => {
        response = await ky
          .get(`http://localhost:4000/me/agendas?key=${key}`)
          .json();
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
