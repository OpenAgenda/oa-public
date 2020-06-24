'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().events add()', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '005.sql'));

  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'queues',
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
        'tracker'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(17026800).events.search.rebuild();
  });

  afterAll(() => {
    testConfig.knex.destroy();
    testConfig.redisClient.quit();
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  describe('simple add', function() {
    let event;

    beforeAll(async () => {
      event = await core.agendas(17026800).events.add(19201989, {
        'thematiques-metropolitaines': 3,
        image_alt_text: 'Un texte obligatoire si l\'image est présente'
      }, {
        context: {
          userUid: 63170203
        }
      });
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
      } = await core.agendas(17026800).events.search({ uid: 19201989 });

      expect(total).toBe(1);
      expect(events[0].uid).toBe(19201989);
    });

  });

  describe('bypass schema validation', () => {

    it('Attempt to add without specifying required value returns a validation error', async () => {
      let error;

      try {
        await core.agendas(17026800).events.add(11111, {}, {
          context: {
            userUid: 63170203
          }
        });
      } catch(e) {
        error = e;
      }

      expect(error.name).toBe('ValidationError');
    });

    it('bypassAdditionalFieldValidation option makes it possible to add event regardless of additional field validation. Used for legacy share ONLY', async () => {
      const result = await core.agendas(17026800).events.add(11111, {}, {
        context: {
          userUid: 63170203
        },
        returnPayload: true,
        bypassAdditionalFieldValidation: true
      });

      expect(result.success).toBe(true);
    });

  });

  describe('aggregated add', function() {
    let result;

    beforeAll(async () => {
      result = await core.agendas(17026800).events.add(18992812, {
        state: 1,
        'thematiques-metropolitaines': 3,
        'image_alt_text': 'Un texte'
      }, {
        paths: [[82910283, 17026855]],
        aggregated: true,
        returnPayload: true
      });
    });

    it('agenda event reference is flagged as aggregated', () => {
      expect(result.event.aggregated).toBe(true)
    });

    it('agenda event reference stores agenda source uid', () => {
      expect(result.event.sourcePaths).toEqual([[82910283, 17026855]]);
    });

    it('state taken is state provided', () => {
      expect(result.event.state).toBe(1);
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
