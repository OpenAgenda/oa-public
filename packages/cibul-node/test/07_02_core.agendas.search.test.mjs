import axios from 'axios';
import api from '../api/index.mjs';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('07 - core - functional (server): core.agendas().get', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '008.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
        'bull',
        'files',
        'events',
        'accessTokens',
        'agendas',
        'aggregators',
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
        'tracker',
      ],
    });

    core = Core(services, testConfig);

    await core.agendas(92983929).events.search.rebuild();
    await core.agendas.rebuildIndex();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    it('search returns all indexed agendas by default', async () => {
      const { total } = await core.agendas.search();

      expect(total).toBe(2);
    });

    it('size nav value limits number of agendas returned in one call', async () => {
      const { agendas } = await core.agendas.search({}, { size: 1 });

      expect(agendas.length).toBe(1);
    });

    it('target specific agendas to fetch through uid filter', async () => {
      const { agendas } = await core.agendas.search({
        uid: [17026800],
      });

      expect(agendas.length).toBe(1);
      expect(agendas[0].uid).toBe(17026800);
    });

    it('target specific agendas to fetch through slug filter', async () => {
      const { agendas } = await core.agendas.search({
        slug: 'le-fennec',
      });

      expect(agendas.length).toBe(1);
      expect(agendas[0].slug).toBe('le-fennec');
    });

    it('after nav value can be used to fetch next results', async () => {
      const { agendas: allAgendas } = await core.agendas.search();
      const { agendas: firstAgendas, after } = await core.agendas.search({}, { size: 1 });

      const { agendas: nextAgendas } = await core.agendas.search({}, {
        after,
      });

      expect(firstAgendas[0].uid).toBe(allAgendas[0].uid);

      expect(nextAgendas[0].uid).toBe(allAgendas[1].uid);
    });

    it('locationSet is indexed and can be used as filter', async () => {
      const { agendas: withLocationSet } = await core.agendas.search({
        locationSet: 4321,
      }, {}, {
        detailed: true,
        includeFields: 'locationSet',
      });

      expect(withLocationSet.length).toBe(1);
      expect(withLocationSet[0].locationSet.uid).toBe(4321);
    });

    it('use includeFields option to fetch summary of agendas', async () => {
      const { agendas } = await core.agendas.search({}, { size: 1 }, { includeFields: ['summary'] });

      expect(Object.keys(agendas[0]).includes('summary')).toBe(true);
    });

    it('use indexed option to include unindexed agendas in results', async () => {
      const { agendas } = await core.agendas.search({}, {}, {
        indexed: null,
        includeFields: 'indexed',
        access: 'internal',
      });

      expect(agendas.filter(a => !a.indexed).length).toBeGreaterThan(0);
      expect(agendas.filter(a => !!a.indexed).length).toBeGreaterThan(0);
    });

    it('use access option to include restricted summary values', async () => {
      const { agendas } = await core.agendas.search({}, { size: 1 }, {
        includeFields: 'summary',
        access: 'administrator',
      });

      expect(Array.isArray(agendas[0].summary.eventCountsByState)).toBe(true);
    });
  });

  describe('api', () => {
    const publicKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';
    let server;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(3000);
    });

    afterAll(() => server.close());

    describe('default', () => {
      let response;

      beforeAll(async () => {
        response = await axios.get(`http://localhost:3000/agendas?key=${publicKey}`);
      });

      it('agendas, total, success and after keys are provided in response', async () => {
        expect(Object.keys(response.data)).toEqual([
          'after',
          'agendas',
          'total',
          'success',
        ]);
      });
    });

    describe('detailed', () => {
      let response;

      beforeAll(async () => {
        response = await axios.get(`http://localhost:3000/agendas?key=${publicKey}&fields[]=summary&fields[]=schema&fields[]=settings`);
      });

      it('explicitely requested fields can be requested', () => {
        expect(Object.keys(response.data.agendas[0]).sort()).toEqual([
          'description',
          'image',
          'official',
          'schema',
          'settings',
          'slug',
          'summary',
          'title',
          'uid',
        ]);
      });
    });
  });
});
