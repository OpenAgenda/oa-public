'use strict';

const Core = require('../core');
const Services = require('../services/init');

const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('13 - core - functional(server): core.agendas().locations.patch', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '016.sql'));

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
        'agendas',
        'agendaEvents',
        'aggregators',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'accessTokens',
        'tracker',
      ],
    });

    core = Core(services, testConfig);

    await core.agendas(64260763).events.search.rebuild();
    await core.agendas(89904399).events.search.rebuild();

    core.services.agendaLocations.task({ reset: true });
    services.aggregators.task();
    await services.simpleCache.clearAll();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('location is patched', async () => {
    core.agendas(64260763).locations.patch(37923057, {
      name: 'Un étang',
    });

    await new Promise(rs => {
      core.services.tracker.on('agendaLocations.syncImpactedEventsAndAgendas.done', async () => {
        const row = await core.services.knex('location').first(['placename']).where('uid', 37923057);
        expect(row.placename).toBe('Un étang');
        rs();
      });
    });
  });

  it('index of agenda where location is patched is refreshed', async () => {
    core.agendas(64260763).locations.patch(37923057, {
      address: '13 rue du désespoir, Roubaix',
    }).then(() => core.services.tracker('patched'));

    await new Promise((rs, rj) => {
      core.services.tracker.on('agendaLocations.syncImpactedEventsAndAgendas.done', async () => {
        const { events } = await core.agendas(64260763).events.search({
          locationUid: 37923057,
        });
        try {
          expect(events[0].location.address).toBe('13 rue du désespoir, Roubaix');
        } catch (e) {
          return rj(e);
        }
        rs();
      }, true);
    });
  });

  it('indices in other agendas referencing events linked to patched location are refreshed', async () => {
    core.agendas(64260763).locations.patch(37923057, {
      address: '23 rue de l\'Espérance, 59100 Roubaix',
    });

    await new Promise((rs, rj) => {
      core.services.tracker.on('agendaLocations.syncImpactedEventsAndAgendas.done', async () => {
        const { events } = await core.agendas(89904399).events.search({ locationUid: 37923057 });
        try {
          expect(events[0].location.address).toBe('23 rue de l\'Espérance, 59100 Roubaix');
        } catch (e) {
          return rj(e);
        }
        rs();
      }, true);
    });
  });
});
