'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const fs = require('fs');
const ih = require('immutability-helper');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const fixtures = require('./fixtures/02_core_agendas_events_create.sql');

const core = require('../core');

const assignClients = require('./utils/assignClients');

const testConfig = require('./testConfig');

describe('core - functional (server): core agenda events create', function() {
  this.timeout(20000);

  const eventData = {
    slug: 'un-evenement',
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
      }, {
        context: {
          userUid: memberUserUid
        }
      });
    });

    describe('response', () => {
      it('created event is provided in response', () => {
        event.slug.should.equal('un-evenement');
      });

      it('created event internal fields are not provided (id)', () => {
        should(event.id).equal(undefined);
      });
    });

    describe('persistence', () => {
      const services = core.loadServices();

      it('contributing member is associated to event', async () => {
        const ae = await services.agendaEvents(17026855).get(event.uid);

        ae.userUid.should.equal(63170200);
      });

      it('event owner is contributing member', async () => {
        const eventSvcEvent = await services.events.get({
          uid: event.uid
        }, {
          internal: true
        });

        eventSvcEvent.ownerUid.should.equal(63170200);
      });

      it('agenda custom values are stored in agenda custom schema', async () => {
        const data = await services.custom(2).get(event.uid);

        data['thematiques-bordeaux-metropole'].should.eql([3, 4]);

        data['categories-agenda-metropolitain'].should.equal(42);
      });

      it('event is created on legacy event data structure', done => {
        services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
          legacyEvent.uid.should.equal(event.uid);
          done();
        });
      });

      it('accessibility is saved in event and legacy event', done => {
        services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
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
        'thematiques-bordeaux-metropole' : [3, 4],
      }, {
        context: {
          userUid: 63170200
        },
        returnPayload: true
      });
    });

    it('agenda formSchema is provided in result', () => {
      Object.keys(result.formSchema).should.eql(['custom', 'fields']);
    });

    it('fields with contributor as "read" access are not provided in schema', () => {
      result.formSchema
        .fields
        .filter(f=> f.field === 'custom_description').length.should.equal(0);
    });

    it('created event is provided in created key', () => {
      result.created.title.fr.should.equal('Un événement');
    });

    it('success boolean is provided as true', () => {
      result.success.should.equal(true);
    });

    it('event id is not in result', () => {
      should(result.created.id).equal(undefined);
    });

  });

  describe('simple create with returnPayload: true and access: "contributor"', function() {

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
        access: 'contributor'
      });
    });

    it('field with "contributor" in read parameter are provided in result', () => {
      result.formSchema
        .fields
        .filter(f=> f.field === 'custom_description').length.should.equal(1);
    });

  });

  describe('draft create', function() {
    let event;

    const memberUserUid = 63170200;
    const agendaUid = 17026855;
    const services = core.loadServices();

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
        draft: true
      });
    });

    it('incomplete event can be saved', () => {
      event.draft.should.equal(1);
    });

    it('draft event is not referenced in agenda', async () => {
      const ae = await services.agendaEvents(agendaUid).get(event.uid);

      should(ae).equal(null);
    });

    it('no legacy event is created for draft', done => {
      services.events.legacy.get({ uid: event.uid }, (err, legacyEvent) => {
        should(legacyEvent).equal(null);
        done();
      });
    });

    it('custom data is stored even if incomplete', async () => {
      const data = await services.custom(2).get(event.uid);

      data.should.eql({
        custom_description: ":')",
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
        formSchemaDataFormat: true
      });
    });

    it('event is created with timings provided in non Date format', () => {
      event.title.fr.should.equal('Un événement');
    });

    it('timings is saved in Date format', () => {
      event.timings[0].begin.should.equal('2019-12-06T10:23:00.000Z');
    });

  });

} );
