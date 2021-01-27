'use strict';

const _ = require('lodash');
const assert = require('assert');
const axios = require('axios');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');
const testConfig = require('./testConfig');
const loadFixtures = require('./fixtures/load');

describe('core - functional (server): core.agendas().events.update()', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '004.sql'));
  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'queues',
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
        'tracker'
      ]
    });

    core = Core(services, testConfig);

    await core.agendas(17026855).events.search.rebuild();
  });

  afterAll(() => {
    core.services.core.destroy();
    testConfig.redisClient.quit();
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test'
      });
    } catch (e) {}
  });

  describe('simple update', function() {
    let event;

    beforeAll(async () => {
      try {
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
          access: 'administrator',
          detailed: true
        });
      } catch (e) {
        console.log(e);
      }
    });

    describe('response', () => {

      it('updated event is provided as a response', () => {
        expect(event.uid).toBe(19201989);
        expect(event.title.fr).toBe('Un événement mis à jour');
      });

      it('updated state is provided in response', () => {
        expect(event.state).toBe(0);
      });

      it('provides the location in a location key', async () => {
        expect(event.location.name).toBe('La boutique');
      });

    });

    describe('persistence', () => {

      it('custom values are updated', async () => {
        const data = await core.services.custom(2).get(event.uid);

        expect(data['thematiques-bordeaux-metropole']).toEqual([3])
      });

      it('event state in agenda is updated', async () => {
        const { state } = await core.services.agendaEvents(17026855).get(19201989);

        expect(state).toBe(0);
      });

    });

    describe('search', () => {
      let result;

      beforeAll(async () => {
        result = await core.agendas(17026855).events.search({
          uid: event.uid,
          state: null
        }, {}, { detailed: true });
      });

      it('indexed document is updated', () => {
        expect(result.events[0]['thematiques-bordeaux-metropole']).toEqual([3])
      });
    });

    describe('fixes', () => {

      it('location store should not be present in result', () => {
        expect(event.location.store).toBeUndefined();
      });

    });

  });

  describe('updates with different accesses', () => {

    beforeAll(() => core.agendas(92983929).events.update(19390293, {
      title: {
        fr: 'Un autre événement mis à jour',
      },
      description: {
        fr: 'Une description'
      },
      image: {
        filename: 'fdqfsdq.jpg'
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

    beforeAll(() => core.agendas(92983929).events.update(19390294, {
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
      expect(data).toEqual({
        'organisation-interne': 'Il faut que Thérèse y soit'
      });
    });

    it('an administrator access can update an administrator field', async () => {
      const data = await core.services.custom(5).get(19390294);
      expect(data).toEqual({
        'organisation-interne': 'Il faut que René y aille'
      });
    });

    it('a moderator cannot publish if role is not in agenda canPublish list', async () => {
      let error;
      try {
        await core.agendas(37026800).events.patch(88888888, {
          state: 2
        }, {
          access: 'moderator'
        });
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe('moderator is not authorized to publish events');
    });

  });

  describe('agenda access on event', () => {

    it('an agenda with ref can_edit at 0 cannot patch event', async () => {
      try {
        await core.agendas(92983929).events.patch(99999999, {
          description: {
            fr: 'Une desc patchée'
          }
        }, {
          access: 'moderator'
        });
      } catch (e) {
        expect(e.message).toBe('Unauthorized');
      }
    });

    it('an agenda wih ref can_edit at 1 can patch event', async () => {
      const updated = await core.agendas(17026855).events.patch(99999999, {
        title: {
          fr: 'Un titre patché'
        }
      }, {
        access: 'moderator'
      });

      expect(updated.title.fr).toBe('Un titre patché');
    });

    it('if agenda does not have edit access and patch excludes event-specific data, patch can occur', async () => {
      const patched = await core.agendas(92983929).events.patch(99999999, {
        state: 2
      }, {
        access: 'moderator'
      });

      expect(patched.state).toBe(2);
    });

  });

  describe('draft update', () => {
    let event;

    beforeAll(async () => {
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
      expect(e.draft).toBe(1);
    });

    it('draft is updated', () => {
      expect(event.title.fr).toBe('Un brouillon mis à jour');
    });

    it('custom data is updated', async () => {
      const data = await core.services.custom(2).get(83902931);
      expect(data['thematiques-bordeaux-metropole']).toEqual([4]);
    });

    it('an undrafted event takes the state required by agenda settings', async () => {
      const event = await core.agendas(17026855).events.update(83902932, {
        title: {
          fr: 'Un brouillon plus brouillon'
        },
        description: {
          fr: 'Une desc courte'
        },
        locationUid: 123,
        timings: [{
          begin: new Date('2019-12-18T14:30:00'),
          end: new Date('2019-12-18T15:30:00')
        }]
      }, {
        draft: false
      });

      assert.equal(event.state, 1);
    });

  });

  describe('state', () => {

    it('contributor does not have access to event state change', async () => {
      const {
        state: stateBefore
      } = await core.services.agendaEvents(17026855).get(19201989);

      const event = await core.agendas(17026855).events.patch(19201989, {
        state: 1
      }, {
        access: 'contributor',
      });

      const {
        state: stateAfter
      } = await core.services.agendaEvents(17026855).get(19201989);

      assert.equal(stateBefore, stateAfter);
      assert(stateAfter !== 1);
    });

    it('administrator can change state', async () => {
      const event = await core.agendas(17026855).events.patch(19201989, {
        state: 2
      }, {
        access: 'administrator',
      });
      assert.equal(event.state, 2);
    });

    it('moderator can change state', async () => {
      const event = await core.agendas(17026855).events.patch(19201989, {
        state: 1
      }, {
        access: 'moderator',
      });
      assert.equal(event.state, 1);
    });

    it('when published event is updated by role listed in moderateOnChangeBy, state reverts to 0', async () => {
      const event = await core.agendas(92983929).events.patch(19390293, {
        title: {
          fr: 'Titre modifié'
        }
      }, {
        access: 'contributor'
      });

      assert.equal(event.state, 0);
    });

  });

  describe('patch with returnPayload: true', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(17026855).events.patch(19201989, {
        state: -1
      }, {
        access: 'moderator',
        returnPayload: true
      });
    });

    describe('response', () => {

      it('success bool is provided in response', () => {
        expect(result.success).toBe(true);
      });

      it('updated event is provided in event response key', () => {
        expect(result.event.description.fr).toBe('Une description');
      });

      it('patched data is in event', () => {
        expect(result.event.state).toBe(-1);
      });

    });

    describe('persistence', () => {

      it('legacy model is patched', async () => {
        const record = await testConfig.knex('review_article')
          .first('*')
          .where('id', 123);

        expect(record.state).toBe(-1);
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

      expect(currentState).toBe(updatedState);
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
      });

      expect((new Date(event.timings[0].begin)).getUTCHours()).toBe(17);
      expect((new Date(event.timings[0].begin)).getMinutes()).toBe(28);

    });

  });

  describe('api', function() {
    let server, accessToken, response;

    beforeAll(done => {
       server = api(core).listen(3000, done);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
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

      beforeAll(async () => {
        try {
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
        } catch (e) {
          console.log(e);
        }
      });

      it('response gives success key if update was a success', () => {
        expect(response.success).toBe(true);
      });

      it('updated event is provided in event key', () => {
        expect(response.event.uid).toBe(19201989);
      });

    });

    describe('unsuccessful update', () => {

      beforeAll(async () => {
        try {
          await axios({
            method: 'post',
            url: 'http://localhost:3000/v2/agendas/17026855/events/19201989',
            headers: {
              'access-token': accessToken,
              nonce: 12893,
              'content-type': 'application/json'
            },
            data: {
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
              'custom_description' : 'Meh',
              'categories-agenda-metropolitain': 43,
              'thematiques-bordeaux-metropole' : [3]
            }
          });
        } catch (e) {
          response = e.response;
        }
      });

      it('response status should be 400', () => {
        expect(response.status).toBe(400);
      });

      it('response body provides validation errors', () => {
        expect(response.data.errors).toEqual([{
          code: 'timings.invalid',
          message: 'Invalid timings',
          field: 'timings',
          step: 'validation'
        }]);
      });

    });

    describe('successful patch', () => {

      beforeAll(async () => {
        try {
          response = await axios({
            method: 'patch',
            url: 'http://localhost:3000/v2/agendas/17026855/events/19390293',
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

        } catch (e) {
          console.log(e.response.data);
        }
      });

      it('status is 200', () => {
        expect(response.status).toBe(200);
      });

      it('body contains event', () => {
        expect(response.data.event.uid).toBe(19390293);
      });

      it('fix: image is maintained', () => {
        expect(response.data.event.image.filename).toEqual('fdqfsdq.jpg');
      });

    });

    describe('monolingual patch', () => {

      it('monolingual patch is by default english', async () => {
        const response = await axios({
          method: 'patch',
          url: 'http://localhost:3000/v2/agendas/17026855/events/19201989',
          headers: {
            'access-token': accessToken,
            nonce: 12345897,
            'content-type': 'application/json'
          },
          data: {
            title: 'Un événement remis à jour'
          }
        });

        expect(response.data.event.title).toEqual({
          en: 'Un événement remis à jour'
        });
      });

      it('monolingual patch is in language specified in header', async () => {
        const response = await axios({
          method: 'patch',
          url: 'http://localhost:3000/v2/agendas/17026855/events/19201989',
          headers: {
            'access-token': accessToken,
            nonce: 123405,
            'content-type': 'application/json',
            lang: 'fr'
          },
          data: {
            title: 'Un événement reremis à jour'
          }
        });

        expect(response.data.event.title).toEqual({
          fr: 'Un événement reremis à jour'
        });
      });

    });

  });

});
