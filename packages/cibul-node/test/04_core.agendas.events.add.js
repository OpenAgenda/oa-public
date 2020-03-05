'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const Services = require('../services/init');
const Core = require('../core');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().events add()', function() {
  this.timeout(20000);
  let core;

  before(() => loadFixtures(testConfig.db, '005.sql'));

  before(() => assignClients(testConfig));

  before(async () => {
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

  after(() => testConfig.knex.destroy());

  after(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  describe('simple add', function() {
    let event;

    before(async () => {
      event = await core.agendas(17026800).events.add(19201989, {
        'thematiques-metropolitaines': 3
      }, {
        context: {
          userUid: 63170203
        }
      });
    });

    it('provides the added event as a response', () => {
      event.uid.should.equal(19201989);
    });

    it('destination agenda additional field value is in response', () => {
      event['thematiques-metropolitaines'].should.eql([3]);
    });

    it('event is indexed in agenda', async () => {
      const {
        total,
        events
      } = await core.agendas(17026800).events.search({ uid: 19201989 });

      total.should.equal(1);
      events[0].uid.should.equal(19201989);
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

      error.name.should.equal('ValidationError');
    });

    it('bypassAdditionalFieldValidation option makes it possible to add event regardless of additional field validation. Used for legacy share ONLY', async () => {
      const result = await core.agendas(17026800).events.add(11111, {}, {
        context: {
          userUid: 63170203
        },
        returnPayload: true,
        bypassAdditionalFieldValidation: true
      });

      result.success.should.equal(true);
    });

  });

  describe('aggregated add', function() {
    let result;

    before(async () => {
      result = await core.agendas(17026800).events.add(18992812, {
        state: 1,
        'thematiques-metropolitaines': 3
      }, {
        paths: [[82910283, 17026855]],
        aggregated: true,
        returnPayload: true
      });
    });

    it('agenda event reference is flagged as aggregated', () => {
      result.event.aggregated.should.equal(true)
    });

    it('agenda event reference stores agenda source uid', () => {
      result.event.sourcePaths.should.eql([[82910283, 17026855]]);
    });

    it('state taken is state provided', () => {
      result.event.state.should.equal(1);
    });
  });

});
