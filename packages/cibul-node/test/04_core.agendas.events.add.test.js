'use strict';

const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().events add()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '005.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
        'files',
        'events',
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
        'accessTokens',
        'tracker'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(17026800).events.search.rebuild();
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) { /**/ }
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('simple add', () => {
    let event;

    beforeAll(async () => {
      event = await core.agendas(17026800).events.add(19201989, {
        title: {
          fr: 'Nouveau titre'
        },
        'thematiques-metropolitaines': 3,
        image_alt_text: 'Un texte obligatoire si l\'image est présente'
      }, {
        context: {
          userUid: 63170203
        }
      });
    });

    it('title is edited', () => {
      expect(event.title).toEqual({ fr: 'Nouveau titre' });
    });

    it('provides the added event as a response', () => {
      expect(event.uid).toBe(19201989);
    });

    it('destination agenda additional field value is in response', () => {
      expect(event['thematiques-metropolitaines']).toEqual([3]);
    });

    it('event is indexed in agenda', async () => {
      const {
        total,
        events
      } = await core.agendas(17026800).events.search({
        uid: 19201989,
        state: null
      }, {}, {
        access: 'administrator'
      });

      expect(total).toBe(1);
      expect(events[0].uid).toBe(19201989);
    });
  });

  describe('schema validation', () => {
    it('Attempt to add without specifying required value returns a validation error', async () => {
      let error;

      try {
        await core.agendas(17026800).events.add(11111, {}, {
          context: {
            userUid: 63170203
          }
        });
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
    });
  });

  describe('aggregated add', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(17026800).events.add(18992812, {
        state: 1,
        'thematiques-metropolitaines': 3,
        image_alt_text: 'Un texte'
      }, {
        paths: [[82910283, 17026855]],
        aggregated: 'f9fdqs3',
        returnPayload: true,
        access: 'contributor'
      });
    });

    it('agenda event reference is flagged as aggregated', () => {
      expect(result.event.aggregated).toBe('f9fdqs3');
    });

    it('agenda event reference stores agenda source uid', () => {
      expect(result.event.sourcePaths).toEqual([[82910283, 17026855]]);
    });

    it('state taken is default state', () => {
      expect(result.event.state).toBe(0);
    });

    it('provided value for additional conditional field is maintained', () => {
      expect(result.event.image_alt_text).toBe('Un texte');
    });

    it('fix: add with unspecified required additional field linked to image is successful when image is not specified', async () => {
      const { success } = await core.agendas(17026800).events.add(18992813, {
        state: 1,
        'thematiques-metropolitaines': 3
      }, {
        paths: [[82910283, 17026855]],
        aggregated: true,
        returnPayload: true
      });

      expect(success).toEqual(true);
    });
  });
});
