'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const axios = require('axios');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');
const testConfig = require('./testConfig');
const loadFixtures = require('./fixtures/load');

describe('core - functional (server): core.agendas().events.update()', function() {
  this.timeout(20000);
  let core;

  before(() => loadFixtures(testConfig.db, '004.sql'));

  before(() => assignClients(testConfig));

  before(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'queues',
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
        'tracker'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(17026855).events.search.rebuild();
  });

  after(() => testConfig.knex.destroy());

  after(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

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
      }, {
        access: 'contributor'
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

      it('custom values are updated', async () => {
        const data = await core.services.custom(2).get(event.uid);

        data['thematiques-bordeaux-metropole'].should.eql([3])
      });

      it('event state in agenda is updated', async () => {
        const { state } = await core.services.agendaEvents(17026855).get(19201989);

        state.should.equal(0);
      });

    });

    describe('search', () => {
      let result;

      before(async () => {
        result = await core.agendas(17026855).events.search({
          uid: event.uid,
          state: null
        }, {}, { detailed: true });
      });

      it('indexed document is updated', () => {
        result.events[0]['thematiques-bordeaux-metropole'].should.eql([3])
      });
    });

    describe('fixes', () => {

      it('location store should not be present in result', () => {
        should(event.location.store).equal(undefined);
      });

    });

  });

  describe('updates with different accesses', () => {

    before(() => core.agendas(92983929).events.update(19390293, {
      title: {
        fr: 'Un autre événement mis à jour',
      },
      description: {
        fr: 'Une description'
      },
      locationUid: 123,
      timings: [{
        begin: new Date('2019-12-18T14:30:00'),
        end: new Date('2019-12-18T15:30:00')
      }],
      'organisation-interne': 'Il faut que René y aille',
      categories: 2
    }, {
      access: 'contributor'
    }));

    before(() => core.agendas(92983929).events.update(19390294, {
      title: {
        fr: 'Et un autre événement mis à jour',
      },
      description: {
        fr: 'Une description'
      },
      locationUid: 123,
      timings: [{
        begin: new Date('2019-12-18T14:30:00'),
        end: new Date('2019-12-18T15:30:00')
      }],
      'organisation-interne': 'Il faut que René y aille',
      categories: 1
    }, {
      access: 'administrator'
    }));

    it('a contributor access cannot update an administrator field', async () => {
      const data = await core.services.custom(5).get(19390293);
      data.should.eql({
        'organisation-interne': 'Il faut que Thérèse y soit'
      });
    });

    it('an administrator access can update an administrator field', async () => {
      const data = await core.services.custom(5).get(19390294);
      data.should.eql({
        'organisation-interne': 'Il faut que René y aille'
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
        draft: true,
        access: 'contributor'
      });
    });

    it('update is still draft', async () => {
      const e = await core.services.events.get({ uid: 83902931 });
      e.draft.should.equal(1);
    });

    it('draft is updated', () => {
      event.title.fr.should.equal('Un brouillon mis à jour');
    });

    it('custom data is updated', async () => {
      const data = await core.services.custom(2).get(83902931);
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

      it('updated event is provided in event response key', () => {
        result.event.description.fr.should.equal('Une description');
      });

      it('patched data is in event', () => {
        result.event.state.should.equal(-1);
      });

    });

    describe('persistence', () => {

      it('legacy model is patched', async () => {
        const record = await testConfig.knex('review_article')
          .first('*')
          .where('id', 123);

        record.state.should.equal(-1);
      });

    });

  });

  describe('other', () => {

    it('if state is not specified in provided data, state is not updated', async () => {
      const {
        state: currentState
      } = await core.services.agendaEvents(17026855).get(19201989);

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
      } = await core.services.agendaEvents(17026855).get(19201989);

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

      (new Date(event.timings[0].begin)).getUTCHours().should.equal(17);
      (new Date(event.timings[0].begin)).getMinutes().should.equal(28);

    });

  });

  describe('api', function() {
    let server, accessToken, response;

    before(done => {
       server = api(core).listen(3000, done);
    });

    after(() => server.close());

    before(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/v2/requestAccessToken',
        headers: {
          'content-type': 'application/json'
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM'
        }
      }).then(r => r.data.access_token);
    });

    describe('successful update', () => {

      before(async () => {
        response = await axios({
          method: 'post',
          url: 'http://localhost:3000/v2/agendas/17026855/events/19201989',
          headers: {
            'access-token': accessToken,
            nonce: 123,
            'content-type': 'application/json'
          },
          data: {
            state: 0,
            featured: true,
            title: {
              fr: 'Un événement mis à jour via l\'api',
              en: 'An updated event through the api'
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
          }
        }).then(r => r.data);
      });

      it('response gives success key if update was a success', () => {
        response.success.should.equal(true);
      });

      it('updated event is provided in event key', () => {
        response.event.uid.should.equal(19201989);
      });

    });

    describe('successful patch', () => {

      before(async () => {
        response = await axios({
          method: 'patch',
          url: 'http://localhost:3000/v2/agendas/17026855/events/19201989',
          headers: {
            'access-token': accessToken,
            nonce: 12345,
            'content-type': 'application/json'
          },
          data: {
            title: {
              fr: 'Un événement mis à jour via l\'api',
              en: 'An updated event through the api'
            }
          }
        });
      });

      it('status is 200', () => {
        response.status.should.equal(200);
      });

      it('body contains event', () => {
        response.data.event.uid.should.equal(19201989);
      });

    });

  });

});
