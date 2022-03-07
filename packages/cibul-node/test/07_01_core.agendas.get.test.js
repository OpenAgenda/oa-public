'use strict';

const _ = require('lodash');
const axios = require('axios');

const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');

const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

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
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'tracker'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(92983929).events.search.rebuild();
    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    it('simple get provides uid, title and slug', async () => {
      const agenda = await core.agendas(92983929).get();

      expect(agenda.uid).toBe(92983929);
      expect(agenda.title).toBe('Un agenda avec un champ contributeur');
      expect(agenda.slug).toBe('agenda-champ-contributeur');
    });

    it('detailed get provides consolidated schema', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
        access: 'administrator'
      });

      expect(agenda.schema.fields.map(f => f.field)).toEqual(['categories', 'organisation-interne']);
    });

    it('detailed get provides information on network', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true
      });

      expect(agenda.network.uid).toBe(1234);
    });

    it('fix: detailed get provides information on network event if access is internal', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
        access: 'internal'
      });

      expect(agenda.network?.uid).toBe(1234);
    });

    it('detailed get provides information on locationSet', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
      });

      expect(agenda.locationSet.uid).toBe(4321);
    });

    it('detailed get with internal access includes admin fields in schema', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
        access: 'internal'
      });

      expect(
        agenda.schema.fields
          .map(f => f.field)
          .filter(f => f === 'organisation-interne')
          .length
      ).toBe(1);
    });

    it('detailed get with internal access and includeEvent includes admin fields in schema', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
        access: 'internal',
        includeEvent: true
      });

      expect(
        agenda.schema.fields
          .map(f => f.field)
          .filter(f => f === 'organisation-interne')
          .length
      ).toBe(1);
    });

    it('detailed get with includeNonDataFields fields and includeEvent includes languages field in schema', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
        access: 'internal',
        includeEvent: true,
        includeNonDataFields: true
      });

      expect(
        agenda.schema.fields
          .map(f => f.field)
          .filter(f => f === 'languages')
          .length
      ).toBe(1);
    });

    it('schema fields each include a schemaType', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
        includeEvent: true
      });

      expect(
        _.uniq(agenda.schema.fields.map(f => f.schemaType))
      ).toEqual(['agenda', 'event']);
    });

    it('schema fields include state', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true,
        includeEvent: true,
        includeAgendaEvent: true,
        includeMember: true,
        access: 'administrator'
      });

      expect(
        !!agenda.schema.fields.find(el => el.field === 'state')
      ).toBe(true);
    });

    it('detailed gets returns a summary object', async () => {
      const agenda = await core.agendas(92983929).get({
        detailed: true
      });

      expect(agenda.summary).toEqual({
        keywords: [],
        publishedEvents: { current: 0, passed: 0, upcoming: 0 },
        recentlyAddedEvents: { contribution: 0, shared: 0, aggregation: 0 },
        viewport: null
      });
    });
  });

  describe('api', () => {
    let server;
    const contributorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    describe('get from non-administrator', () => {
      let agenda;

      beforeAll(async () => {
        const result = await axios.get(`http://localhost:3000/agendas/92983929?key=${contributorKey}`);
        agenda = result.data;
      });

      it('simple get provides uid, title and slug', async () => {
        expect(agenda.uid).toBe(92983929);
        expect(agenda.title).toBe('Un agenda avec un champ contributeur');
        expect(agenda.slug).toBe('agenda-champ-contributeur');
      });

      it('get from non-administrator does not provide administrator access field', () => {
        expect(agenda.settings.contribution.authorizedIPAddresses).toBe(undefined);
      });
    });

    describe('get from administrator', () => {
      let agenda;

      beforeAll(async () => {
        const result = await axios.get('http://localhost:3000/agendas/92983929?key=0toI8hA1if8auC1hFOmegP36aMbVg1N9');
        agenda = result.data;
      });

      it('get from administrator provides administrator-access field', () => {
        expect(agenda.settings.contribution.authorizedIPAddresses).toEqual([]);
      });
    });

    describe('get by slug from non-admin', () => {
      let agenda;

      beforeAll(async () => {
        const result = await axios.get(
          `http://localhost:3000/agendas/slug/agenda-champ-contributeur?key=${contributorKey}`
        );
        agenda = result.data;
      });

      it('simple get provides uid, title and slug', async () => {
        expect(agenda.uid).toBe(92983929);
      });
    });
  });
});
