'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const axios = require('axios');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');
const request = require('superagent');

const api = require('../api');
const assignClients = require('./utils/assignClients');
const Core = require('../core');
const Services = require('../services/init');
const fixtures = {
  sql: require('./fixtures/002.sql'),
  events: require('./fixtures/events')
};
const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create()', function() {
  this.timeout(20000);
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

  before(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures.sql);

    con.end();
  });

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
        'accessTokens',
        'tracker'
      ]
    });

    core = Core(services, testConfig);
  });

  after(() => testConfig.knex.destroy());

  describe('simple create', function() {
    let event;

    const memberUserUid = 63170200;

    before(async () => {
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
        accessibility: { sl: true },
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
        event.slug.should.equal('un-evenement');
      });

      it('created event internal fields are not provided (id)', () => {
        should(event.id).equal(undefined);
      });

      it('created event does not include field with "moderator" read access', () => {
        should(event.custom_description).equal(undefined);
      });
    });

    describe('persistence', () => {

      it('contributing member is associated to event', async () => {
        const ae = await core.services.agendaEvents(17026855).get(event.uid);

        ae.userUid.should.equal(63170200);
      });

      it('event owner is contributing member', async () => {
        const eventSvcEvent = await core.services.events.get({
          uid: event.uid
        }, {
          internal: true
        });

        eventSvcEvent.ownerUid.should.equal(63170200);
      });

      it('agenda custom values are stored in agenda custom schema', async () => {
        const data = await core.services.custom(2).get(event.uid);

        data['thematiques-bordeaux-metropole'].should.eql([3, 4]);

        data['categories-agenda-metropolitain'].should.equal(42);
      });

      it('custom fields with write set for "moderator" are not edited through "contributor" access', async () => {
        const data = await core.services.custom(2).get(event.uid);
        should(data.custom_description).equal(undefined);
      });

      it('event is created on legacy event data structure', done => {
        core.services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
          legacyEvent.uid.should.equal(event.uid);
          done();
        });
      });

      it('accessibility is saved in event and legacy event', done => {
        core.services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
          legacyEvent.accessibility.should.eql({
            mi: false,
            hi: false,
            pi: false,
            vi: false,
            sl: true
          });

          event.accessibility.should.eql({
            mi: false,
            hi: false,
            pi: false,
            vi: false,
            sl: true
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

        reviewTagArticles.map(rta => rta.review_tag_id).should.eql([
          9661, // Administration (2.3)
          9662  // Aéronautique (2.4)
        ]);
      });

    });

  });

  describe('simple create with returnPayload: true', function() {

    let result;

    before(async () => {
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
      Object.keys(result.formSchema).should.eql(['custom', 'fields']);
    });

    it('fields with moderator as access are not provided in schema', () => {
      result.formSchema
        .fields
        .filter(f=> f.field === 'custom_description').length.should.equal(0);
    });

    it('created event is provided in event key', () => {
      result.event.title.fr.should.equal('Un événement');
    });

    it('success boolean is provided as true', () => {
      result.success.should.equal(true);
    });

    it('event id is not in result', () => {
      should(result.event.id).equal(undefined);
    });

    it('originAgenda is in created event', () => {
      result.event.originAgenda.uid.should.equal(17026855);
    });

    it('state is in event', () => {
      result.event.state.should.equal(2);
    });

    it('member is part of payload', () => {
      result.member.userUid.should.equal(63170200);
    });

    it('agenda is part payload', () => {
      result.agenda.uid.should.equal(17026855);
    });

  });

  describe('simple create with returnPayload: true and access: "moderator"', function() {

    let result;

    before(async () => {
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
      result.formSchema
        .fields
        .filter(f=> f.field === 'custom_description').length.should.equal(1);
    });

  });

  describe('draft create', function() {
    let event;

    const memberUserUid = 63170200;
    const agendaUid = 17026855;

    before(async () => {
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
      event.draft.should.equal(1);
    });

    it('draft event is not referenced in agenda', async () => {
      const ae = await core.services.agendaEvents(agendaUid).get(event.uid);

      should(ae).equal(null);
    });

    it('no legacy event is created for draft', done => {
      core.services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
        should(legacyEvent).equal(null);
        done();
      });
    });

    it('custom data is stored even if incomplete', async () => {
      const data = await core.services.custom(2).get(event.uid);

      data.should.eql({
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

    before(async () => {
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
      event.title.fr.should.equal('Un événement');
    });

    it('timings is saved in Date format', () => {
      event.timings[0].begin.should.equal('2019-12-06T10:23:00.000Z');
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
        e.detail[0].should.eql({
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
        e.detail.should.eql([{
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
        e.detail.should.eql([{
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

    before(async () => {
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
      response.success.should.equal(true);
    });

    it('response provides created event in event key', () => {
      response.event.slug.should.equal('un-evenement-cree-par-api');
    });

    it('create with superagent', async () => {
      const response = await request.post('http://localhost:3000/v2/agendas/17026855/events')
        .type('form')
        .accept('json')
        .query({ key: null })
        .set('access-token', accessToken)
        .set('nonce', _.random(Math.pow(10, 6)))
        .field({
          data: JSON.stringify(fixtures.events[3])
        });

      response.body.success.should.equal(true);
    });

  });

} );
