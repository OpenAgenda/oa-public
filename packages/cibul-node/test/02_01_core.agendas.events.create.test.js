'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const axios = require('axios');
const ih = require('immutability-helper');
const request = require('superagent');

const api = require('../api');
const assignClients = require('./utils/assignClients');
const Core = require('../core');
const Services = require('../services/init');
const eventsFixtures = require('./fixtures/events');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create()', function() {
  let core;

  const eventData = {
    title: {
      fr: 'Un événement'
    },
    description: {
      fr: 'Un tout petit événement'
    },
    timings: [ {
      begin: new Date( '2019-05-06T10:00:00' ),
      end: new Date( '2019-05-06T11:00:00' )
    } ],
    keywords: {
      fr: [ 'un', 'deux', 'trois' ]
    },
    location: {
      uid: 123
    },
    'categories-agenda-metropolitain': 42,
    'thematiques-bordeaux-metropole' : [3, 4],
    accessibility: { sl: true }
  };

  beforeAll(() => loadFixtures(testConfig.db, '002.sql'));

  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
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

  describe('simple create', function() {
    let event;

    const memberUserUid = 63170200;

    beforeAll(async () => {
      event = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Test de la lib core'
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00')
        }],
        keywords: {
          fr: ['un', 'deux', 'trois']
        },
        location: {
          uid: 123
        },
        accessibility: { ii: true },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [3, 4],
        'custom_description': 'Oui bah non'
      }, {
        context: {
          userUid: memberUserUid
        },
        access: 'contributor'
      });
    });

    describe('response', () => {
      it('created event is provided in response', () => {
        expect(event.slug).toBe('un-evenement');
      });

      it('created event internal fields are not provided (id)', () => {
        expect(event.id).toBeUndefined();
      });

      it('created event does not include field with "moderator" read access', () => {
        expect(event.custom_description).toBeUndefined();
      });
    });

    describe('persistence', () => {

      it('contributing member is associated to event', async () => {
        const ae = await core.services.agendaEvents(17026855).get(event.uid);

        expect(ae.userUid).toBe(63170200);
      });

      it('event owner is contributing member', async () => {
        const eventSvcEvent = await core.services.events.get({
          uid: event.uid
        }, {
          internal: true
        });

        expect(eventSvcEvent.ownerUid).toBe(63170200);
      });

      it('agenda custom values are stored in agenda custom schema', async () => {
        const data = await core.services.custom(2).get(event.uid);

        expect(data['thematiques-bordeaux-metropole']).toEqual([3, 4]);

        expect(data['categories-agenda-metropolitain']).toBe(42);
      });

      it('custom fields with write set for "moderator" are not edited through "contributor" access', async () => {
        const data = await core.services.custom(2).get(event.uid);
        expect(data.custom_description).toBeUndefined();
      });

      it('event is created on legacy event data structure', done => {
        core.services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
          expect(legacyEvent.uid).toBe(event.uid);
          done();
        });
      });

      it('accessibility is saved in event and legacy event', done => {
        core.services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
          expect(legacyEvent.accessibility).toEqual({
            mi: false,
            hi: false,
            pi: false,
            vi: false,
            ii: true
          });

          expect(event.accessibility).toEqual({
            mi: false,
            hi: false,
            pi: false,
            vi: false,
            ii: true
          });

          done();
        });
      });

      it('legacy entries were created for custom fields', async () => {
        const legacyEvent = await testConfig
          .knex('event')
          .first('*')
          .where('uid', event.uid);

        const reviewArticle = await testConfig
          .knex('review_article')
          .first('id')
          .where('event_id', legacyEvent.id)
          .where('review_id', 218);

        const reviewTagArticles = await testConfig
          .knex('review_tag_article')
          .select('*')
          .where('review_article_id', reviewArticle.id);

        expect(reviewTagArticles.map(rta => rta.review_tag_id)).toEqual([
          9661, // Administration (2.3)
          9662  // Aéronautique (2.4)
        ]);
      });

    });

    describe('search', () => {
      let result;

      beforeAll(async () => {
        result = await core.agendas(17026855).events.search({ uid: event.uid });
      });

      it('event is retrieved by its uid', async () => {
        expect(result.total).toBe(1);

        expect(result.events[0].uid).toBe(event.uid);
      });

    });

  });

  describe('simple create with returnPayload: true', function() {

    let result;

    beforeAll(async () => {
      result = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Test de la lib core'
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00')
        }],
        location: {
          uid: 123
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [3, 4]
      }, {
        context: {
          userUid: 63170200
        },
        returnPayload: true,
        access: 'contributor'
      });
    });

    it('agenda formSchema is provided in result', () => {
      expect(Object.keys(result.formSchema)).toEqual(['custom', 'fields']);
    });

    it('fields with moderator as access are not provided in schema', () => {
      expect(result.formSchema
        .fields
        .filter(f=> f.field === 'custom_description').length).toBe(0);
    });

    it('created event is provided in event key', () => {
      expect(result.event.title.fr).toBe('Un événement');
    });

    it('success boolean is provided as true', () => {
      expect(result.success).toBe(true);
    });

    it('event id is not in result', () => {
      expect(result.event.id).toBeUndefined();
    });

    it('originAgenda is in created event', () => {
      expect(result.event.originAgenda.uid).toBe(17026855);
    });

    it('state is in event', () => {
      expect(result.event.state).toBe(2);
    });

    it('member is part of payload', () => {
      expect(result.member.userUid).toBe(63170200);
    });

    it('agenda is part payload', () => {
      expect(result.agenda.uid).toBe(17026855);
    });

  });

  describe('simple create with returnPayload: true and access: "moderator"', function() {

    let result;

    beforeAll(async () => {
      result = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Test de la lib core'
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00')
        }],
        'categories-agenda-metropolitain': 42,
        location: {
          uid: 123
        }
      }, {
        context: {
          userUid: 63170200
        },
        returnPayload: true,
        access: 'moderator'
      });
    });

    it('field with "moderator" in read parameter are provided in result', () => {
      expect(result.formSchema
        .fields
        .filter(f=> f.field === 'custom_description').length).toBe(1);
    });

  });

  describe('draft create', function() {
    let event;

    const memberUserUid = 63170200;
    const agendaUid = 17026855;

    beforeAll(async () => {
      event = await core.agendas(agendaUid).events.create({
        title: {
          fr: 'Un événement brouillon'
        },
        custom_description: ':\')'
      }, {
        context: {
          userUid: memberUserUid
        },
        draft: true,
        access: 'contributor'
      });
    });

    it('incomplete event can be saved', () => {
      expect(event.draft).toBe(1);
    });

    it('draft event is not referenced in agenda', async () => {
      const ae = await core.services.agendaEvents(agendaUid).get(event.uid);

      expect(ae).toBeNull();
    });

    it('no legacy event is created for draft', done => {
      core.services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
        expect(legacyEvent).toBeNull();
        done();
      });
    });

    it('custom data is stored even if incomplete', async () => {
      const data = await core.services.custom(2).get(event.uid);

      expect(data).toEqual({
        intermunicipal_interest: [],
        recurring: [],
        'thematiques-bordeaux-metropole': [],
        'bordeaux-metropole': [],
        'categories-agenda-metropolitain': null
      });
    });

  });

  describe('data format variations', function () {
    let event;

    beforeAll(async () => {
      event = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Autre format d\'horaires'
        },
        timings: [{
          begin: {
            date: '2019-12-06',
            hours: 11,
            minutes: 23
          },
          end: {
            date: '2019-12-06',
            hours: 11,
            minutes: 50
          }
        }],
        'categories-agenda-metropolitain': 42,
        location: {
          uid: 123
        }
      }, {
        context: {
          userUid: 63170200
        },
        formSchemaDataFormat: true,
        access: 'contributor'
      });
    });

    it('event is created with timings provided in non Date format', () => {
      expect(event.title.fr).toBe('Un événement');
    });

    it('timings is saved in Date format', () => {
      expect(event.timings[0].begin).toBe('2019-12-06T10:23:00.000Z');
    });

  });

  describe('errors and exceptions', function() {
    const validData = {
      title: {
        fr: 'Un événement'
      },
      description: {
        fr: 'Un tout petit événement'
      },
      timings: [ {
        begin: new Date( '2019-05-06T10:00:00' ),
        end: new Date( '2019-05-06T11:00:00' )
      } ],
      location: {
        uid: 123
      },
      'categories-agenda-metropolitain': 42,
      'thematiques-bordeaux-metropole' : [3, 4]
    };

    const options = {
      context: {
        userUid: 63170200
      },
      access: 'contributor'
    };

    it('something about a validation error', async () => {
      try {
        await core.agendas(17026855).events.create(ih(validData, {
          $unset: ['title']
        }), options);
      } catch (e) {
        expect(e.detail[0]).toEqual({
          lang: 'fr',
          field: 'title',
          code: 'required',
          message: 'a string is required',
          origin: '',
          step: 'validation'
        });
      }
    });

    it('create with location uid matching no location returns validation error', async () => {
      try {
        await core.agendas(17026855).events.create(ih(validData, {
          location: {
            $set: { uid: 124 }
          }
        }), options);
      } catch (e) {
        expect(e.detail).toEqual([{
          field: 'location',
          code: 'invalid',
          message: 'provided location uid is invalid',
          origin: undefined,
          step: 'validation'
        }]);
      }
    });

    it('create without specified location returns validation error', async () => {
      try {
        await core.agendas(17026855).events.create(ih(validData, {
          $unset: ['location']
        }), options);
      } catch (e) {
        expect(e.detail).toEqual([{
          code: 'location.required',
          message: 'a integer is required',
          origin: undefined,
          field: 'location',
          step: 'validation'
        }]);
      }
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

    describe('successful create', () => {

      beforeAll(async () => {
        response = await axios({
          method: 'post',
          url: 'http://localhost:3000/v2/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 123,
            'content-type': 'application/json'
          },
          data: {
            title: {
              fr: 'Un événement créé par API'
            },
            description: {
              fr: 'Un tout petit événement'
            },
            timings: [ {
              begin: new Date( '2019-05-06T10:00:00' ),
              end: new Date( '2019-05-06T11:00:00' )
            } ],
            keywords: {
              fr: [ 'un', 'deux', 'trois' ]
            },
            location: {
              uid: 123
            },
            'categories-agenda-metropolitain': 42,
            'thematiques-bordeaux-metropole' : [3, 4],
            accessibility: { sl: true }
          }
        }).then(r => r.data);
      });

      it('response gives success key at true if creation was a success', () => {
        expect(response.success).toBe(true);
      });

      it('response provides created event in event key', () => {
        expect(response.event.slug).toBe('un-evenement-cree-par-api');
      });

      it('create with superagent', async () => {
        const response = await request.post('http://localhost:3000/v2/agendas/17026855/events')
          .type('form')
          .accept('json')
          .query({ key: null })
          .set('access-token', accessToken)
          .set('nonce', _.random(Math.pow(10, 6)))
          .field({
            data: JSON.stringify(eventsFixtures[3])
          });

        expect(response.body.success).toBe(true);
      });

    });

    describe('create with one language in input', () => {
      let response;

      const data = {
        title: 'Un autre événement créé par API',
        description: 'Un tout petit événement',
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00')
        }],
        keywords: ['un', 'deux', 'trois'],
        location: {
          uid: 123
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [3, 4],
        accessibility: { sl: true }
      }

      it('Event is created in english if lang is not specified', async () => {
        const response = await axios({
          method: 'post',
          url: 'http://localhost:3000/v2/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 123456,
            'content-type': 'application/json'
          },
          data
        }).then(r => r.data);

        expect(response.event.title).toEqual({
          en: 'Un autre événement créé par API'
        });
      });

      it('Event is created in french if lang is set to french in header', async () => {
        const response = await axios({
          method: 'post',
          url: 'http://localhost:3000/v2/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 1234567,
            'content-type': 'application/json',
            lang: 'fr'
          },
          data
        }).then(r => r.data);

        expect(response.event.title).toEqual({
          fr: 'Un autre événement créé par API'
        });
      });

    });

    describe('unsuccessful create (invalid data)', () => {
      let response;

      beforeAll(async () => {
        await axios({
          method: 'post',
          url: 'http://localhost:3000/v2/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 1234,
            'content-type': 'application/json'
          },
          data: {
            title: {
              fr: 'Un événement créé par API'
            },
            timings: [],
            location: {
              uid: 123
            },
            'categories-agenda-metropolitain': 42,
            'thematiques-bordeaux-metropole' : [3, 4]
          }
        }).catch(e => {
          response = e.response;
        });
      });

      it('response is 400', () => {
        expect(response.status).toBe(400);
      });

      it('list of validation errors is provided in body', () => {
        expect(response.data.errors).toEqual([{
          lang: 'fr',
          field: 'description',
          code: 'required',
          message: 'a string is required',
          origin: '',
          step: 'validation'
        }, {
          code: 'timings.empty',
          message: 'At least one timing is required',
          field: 'timings',
          step: 'validation'
        }]);
      });

    });

  });

} );
