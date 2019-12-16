'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/03_core_agendas_events_update.sql');

const core = require('../core');

const testConfig = require('./testConfig');

describe('core - functional (server): core agendas() events.update()', function() {
  this.timeout(20000);

  before(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  before(() => assignClients(testConfig));

  before(async () => {
    await core.init(testConfig, {
      enabled: [
        'queues',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys'
      ]
    });
  });

  after(() => testConfig.knex.destroy());

  describe('simple update', function() {
    let event;

    before(async () => {
      event = await core.agendas(17026855).events.update(19201989, {
        state: 0,
        featured: true,
        title: {
          fr: 'Un événement mis à jour',
          en: 'An updated event'
        },
        description: {
          fr: 'Une description',
          en: 'A desc'
        },
        location: {
          uid: 123
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00')
        }, {
          begin: new Date('2019-05-06T12:00:00'),
          end: new Date('2019-05-06T13:00:00')
        }],
        'custom_description' : 'Meh',
        'categories-agenda-metropolitain': 43,
        'thematiques-bordeaux-metropole' : [3]
      });
    });

    describe('response', () => {

      it('updated event is provided as a response', () => {
        event.uid.should.equal(19201989);
        event.title.fr.should.equal('Un événement mis à jour');
      });

      it('updated state is provided in response', () => {
        event.state.should.equal(0);
      });

      it('provides the location in a location key', async () => {
        event.location.name.should.equal('La boutique');
      });

    });

    describe('persistence', () => {
      const services = core.loadServices();

      it('custom values are updated', async () => {
        const data = await services.custom(2).get(event.uid);

        data['thematiques-bordeaux-metropole'].should.eql([3])
      });

      it('event state in agenda is updated', async () => {
        const { state } = await services.agendaEvents(17026855).get(19201989);

        state.should.equal(0);
      });

    });

    describe('fixes', () => {

      it('location store should not be present in result', () => {
        should(event.location.store).equal(undefined);
      });

    });

  });

  describe('draft update', function() {
    let event;

    before(async () => {
      event = await core.agendas(17026855).events.update(83902931, {
        title: {
          fr: 'Un brouillon mis à jour',
          en: 'An updated event'
        },
        description: {
          fr: 'Une description',
          en: 'A desc'
        },
        'custom_description' : 'Meh',
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [4]
      }, {
        draft: true
      });
    });

    it('update is still draft', async () => {
      const e = await core.loadServices().events.get({ uid: 83902931 });
      e.draft.should.equal(1);
    });

    it('draft is updated', () => {
      event.title.fr.should.equal('Un brouillon mis à jour');
    });

    it('custom data is updated', async () => {
      const data = await core.loadServices().custom(2).get(83902931);
      data['thematiques-bordeaux-metropole'].should.eql([4]);
    });

  });

  describe('patch with returnPayload: true', () => {
    let result;

    before(async () => {
      result = await core.agendas(17026855).events.patch(19201989, {
        state: -1
      }, {
        returnPayload: true
      });
    });

    describe('response', () => {

      it('success bool is provided in response', () => {
        result.success.should.equal(true);
      });

      it('updated event is provided in updated response key', () => {
        result.updated.description.fr.should.equal('Une description');
      });

      it('patched data is in updated event', () => {
        result.updated.state.should.equal(-1);
      });

    });

    describe('persistence', () => {
      const services = core.loadServices();

      it('legacy model is patched', async () => {
        const record = await testConfig.knex('review_article')
          .first('*')
          .where('id', 123);

        record.state.should.equal(-1);
      });

    });

  });

  describe('other', () => {
    const services = core.loadServices();

    it('if state is not specified in provided data, state is not updated', async () => {
      const {
        state: currentState
      } = await services.agendaEvents(17026855).get(19201989);

      await core.agendas(17026855).events.update(19201989, {
        featured: true,
        title: {
          fr: 'Un événement remis à jour',
          en: 'An updated event'
        },
        description: {
          fr: 'Une description',
          en: 'A desc'
        },
        location: {
          uid: 123
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00')
        }, {
          begin: new Date('2019-05-06T12:00:00'),
          end: new Date('2019-05-06T13:00:00')
        }],
        'categories-agenda-metropolitain': 43,
        'thematiques-bordeaux-metropole' : [3]
      });

      const {
        state: updatedState
      } = await services.agendaEvents(17026855).get(19201989);

      currentState.should.equal(updatedState);
    });

    it('event can be updated with timings specifying begin&end as { date, hours, minutes } objects', async () => {

      const event = await core.agendas(17026855).events.patch(19201989, {
        timings: [{
          begin: {
            date: '2019-12-14',
            hours: 18,
            minutes: 28
          },
          end: {
            date: '2019-12-14',
            hours: 18,
            minutes: 40
          }
        }]
      }, { formSchemaDataFormat: true });

      (new Date(event.timings[0].begin)).getHours().should.equal(18);
      (new Date(event.timings[0].begin)).getMinutes().should.equal(28);

    });

  });

});
