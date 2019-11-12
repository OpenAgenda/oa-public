'use strict';

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );
const fixtures = require( 'fs' ).readFileSync( __dirname + '/fixtures/03_04_core_agenda_events_update_remove.sql', 'utf-8' );
const ih = require( 'immutability-helper' );
const should = require( 'should' );
const VError = require( 'verror' );

const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const agendas = require( '@openagenda/agendas' );
const agendaEvents = require( '@openagenda/agenda-events' );

const config = require( '../config' );
const core = require( '../core' );

const schemaNames = require( './mock/schemaNames' );
const getLogConfig = require( './mock/getLogConfig' );
const assignClients = require( './utils/assignClients' );

const testConfig = {
  queues: {},
  db: {
    user: 'root',
    password: 'grut',
    database: 'oatest'
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  schemas: schemaNames,
  tmpFolderPath: '/var/tmp',
  aws: {
    bucket: 'openagendatest',
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    defaultImagePath: config.aws.defaultImagePath,
    imageBucketPath: 'https://openagendatest.s3.amazonaws.com/'
  },
  esLocation: {
    //log: [  ],
    index: 'locations',
    apiVersion: '1.3',
    timeout: 30000
  },
  es: {
    host: process.env.ELASTICSEARCH_134_DEV_HOST,
    port: process.env.ELASTICSEARCH_134_DEV_PORT
  },
  es53: {
    host: process.env.ELASTICSEARCH_533_DEV_HOST,
    port: process.env.ELASTICSEARCH_533_DEV_PORT
  },
  getLogConfig
};


describe('core - functional ( server ): agenda event update', function() {
  this.timeout(20000);

  before(() => assignClients(testConfig));

  before(async () => {
    const con = mysql.createConnection(Object.assign(_.pick(config.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));
    const result = await query(fixtures);

    con.end();
  });

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
        'legacy',
        'users',
        'keys'
      ]
    });
  });

  after(() => {
    return testConfig.knex.destroy();
  });

  describe('successful update', () => {

    let event, agenda, updateResult;

    before(done => {
      agendas.get({ uid: 17026855 }, { internal: true }, (err, a) => {
        agenda = a;

        done();
      });
    });

    before(async () => {

      const createResult = await core.agendas(17026800).events.create({
        slug: 'un-event',
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Une description'
        },
        location: {
          uid: 123
        },
        timings: [ {
          begin: new Date( '2019-05-06T10:00:00' ),
          end: new Date( '2019-05-06T11:00:00' )
        } ]
      });

      const result = await core.agendas(17026855).events.add(createResult.created.uid, {
        state: 2,
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [3, 4]
      });

      event = createResult.created;
    });

    before(async () => {
      updateResult = await core.agendas(17026855).events.update(event.uid, {
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
        timings: [ {
          begin: new Date( '2019-05-06T10:00:00' ),
          end: new Date( '2019-05-06T11:00:00' )
        }, {
          begin: new Date,
          end: new Date
        } ],
        'custom_description' : 'Meh',
        'categories-agenda-metropolitain': 43,
        'thematiques-bordeaux-metropole' : [3, 4]
      });
    });

    describe('service persistence', () => {

      it('the core event was updated', async () => {
        _.pick(await events.get({ uid: event.uid }), ['title'])
          .should.match({
            title: {
              fr: 'Un événement mis à jour',
              en: 'An updated event'
            }
          });
      });

      it('the state of the agenda event was updated', async () => {
        (await agendaEvents(17026855).get(event.uid))
          .should.match( {
            featured: true,
            state: 0
          });
      });

      it('the custom data is updated', async () => {
        const updatedCustom = await custom(agenda.formSchemaId).get(event.uid);

        updatedCustom.should.eql( {
          custom_description: 'Meh',
          intermunicipal_interest: [],
          recurring: [],
          'thematiques-bordeaux-metropole': [ 3, 4 ],
          'bordeaux-metropole': [],
          'categories-agenda-metropolitain': 43
        });
      });

    });

    describe('result', () => {
      it('provides a success key, true when operation was successful', () => {
        updateResult.success.should.equal(true);
      });

      it('provides the custom values in the updated event', () => {
        updateResult.updated['categories-agenda-metropolitain'].should.equal(43);
      });

      it('provides the main event values', () => {
        updateResult.updated.title.fr.should.equal('Un événement mis à jour');
      });

      it('provides details on the location in a location key', () => {
        updateResult.updated.location.name.should.equal('La boutique');
      });

      it('provides details on the agenda in an agenda key', () => {
        updateResult.agenda.title.should.equal('La Gargouille');
      });

      it('provides details on the origin agenda in an originAgenda key', () => {
        updateResult.originAgenda.title.should.equal('Le Fennec');
      });

      it('provides the full merged schema with internal fields in a formSchema key', () => {
        updateResult.formSchema.fields.map(f=>f.field).should.eql([
          'custom_description',
          'title',
          'location',
          'intermunicipal_interest',
          'recurring',
          'thematiques-bordeaux-metropole',
          'bordeaux-metropole',
          'categories-agenda-metropolitain',
          'image',
          'imageCredits',
          'description',
          'keywords',
          'longDescription',
          'conditions',
          'age',
          'registration',
          'accessibility',
          'timings',
          'id',
          'uid',
          'slug',
          'draft',
          'private',
          'timezone',
          'createdAt',
          'updatedAt',
          'agendaUid',
          'locationUid'
        ]);
      });
    });

    describe('fixes', () => {

      it('location store should not be present in result', () => {
        should(updateResult.updated.location.store).equal(undefined);
      });

    });

    describe('other', () => {
      it('if update does not specify state, state should be unchanged', async () => {

        ( await agendaEvents( 17026855 ).get( event.uid ) ).state.should.equal( 0 );

        await core.agendas( 17026855 ).events.update( event.uid, {
          title: {
            fr: 'Un événement remis à jour'
          },
          description: {
            fr: 'Une description'
          },
          location: { uid: 123 },
          timings: [ {
            begin: new Date( '2019-05-06T10:00:00' ),
            end: new Date( '2019-05-06T11:00:00' )
          } ],
          'custom_description' : 'Meh',
          'categories-agenda-metropolitain': 43,
          'thematiques-bordeaux-metropole' : [ 3, 4 ]
        } );

        ( await agendaEvents( 17026855 ).get( event.uid ) ).state.should.equal( 0 );

      });
    });


  } );

  describe('successful partial update', () => {

    let createResult, updateResult;

    before(async () => {

      createResult = await core.agendas(17026855).events.create( {
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Une description'
        },
        location: {
          uid: 123
        },
        timings: [ {
          begin: new Date( '2019-05-06T10:00:00' ),
          end: new Date( '2019-05-06T11:00:00' )
        } ],
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ]
      } );

    });

    before(async () => {
      updateResult = await core.agendas(17026855).events.update(createResult.created.uid, {
        title: {
          fr: 'Un événement mis à jour',
          en: 'An updated event'
        },
        'categories-agenda-metropolitain': 43
      }, { partial: true });
    });

    it('event field specified in partial update data is updated', () => {
      updateResult.updated.title.should.eql({
        fr: 'Un événement mis à jour',
        en: 'An updated event'
      });
    });

    it('custom field specified in partial update data is updated', () => {
      updateResult.updated['categories-agenda-metropolitain'].should.equal(43);
    });

    it('event fields not specified in partial update are not modified', () => {
      ['id', 'uid', 'slug', 'description', 'longDescription'].forEach(field => {
        should(createResult.created[field]).eql(updateResult.updated[field]);
      });
    });

    it('custom fields not specified in partial update are not modified', () => {
      ['thematiques-bordeaux-metropole'].forEach(field => {
        should(createResult.created[field]).eql(updateResult.updated[field]);
      });
    });

  });

  describe( 'state change through partial update', () => {

    let createResult, updateResult;

    before(async () => {

      createResult = await core.agendas(17026855).events.create({
        state: 0,
        title: {
          fr: 'Un événement à modérer'
        },
        description: {
          fr: 'Une description d\'événement à modérer'
        },
        location: {
          uid: 123
        },
        timings: [{
          begin: new Date( '2019-08-12T10:00:00' ),
          end: new Date( '2019-08-12T11:00:00' )
        }],
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [3, 4]
      });

    });

    before(async () => {
      updateResult = await core.agendas( 17026855 ).events.update( createResult.created.uid, {
        state: 2
      }, { partial: true });
    });

    it('event state was not published at creation', () => {
      createResult.created.state.should.equal(0);
    });

    it('event state is published after update', () => {
      updateResult.updated.state.should.equal(2);
    });

  } );

  describe( 'other', () => {

    const agendaUid = 17026855;

    let eventUid;

    const errors = [];

    let result;

    before( async () => {

      const result = await core.agendas(agendaUid).events.create({
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Une desc'
        },
        location: {
          uid: 123
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00')
        }],
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [3, 4]
      });

      eventUid = result.created.uid;

    } );

    before( async () => {

      result = await core.agendas( agendaUid ).events.update( eventUid, {
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Une desc'
        },
        location: {
          uid: 123
        },
        timings: [ {
          begin: {
            date: '2019-02-15',
            hours: 12,
            minutes: 39
          },
          end: {
            date: '2019-02-15',
            hours: 12,
            minutes: 50
          }
        } ],
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ]
      }, { formSchemaDataFormat: true } );

    } );

    it('event can be updated using form schema data format', () => {
      result.updated.locationUid.should.equal( 123 );
    });

  } );

  describe( 'draft', () => {

    const agendaUid = 17026855;

    let draftEventUid;

    const errors = [];

    let result;

    before(async () => {

      const result = await core.agendas(agendaUid).events.create({
        title: {
          fr: 'Un événement'
        },
      }, { draft: true });

      draftEventUid = result.created.uid;

    });

    it('an update of a draft is possible with a draft option set', async () => {

      const result = await core.agendas(agendaUid).events.update(draftEventUid, {
        title: {
          fr: 'Un événement mis à jour'
        }
      }, { draft: true });

      result.updated.draft.should.ok();

      result.updated.title.should.eql({
        fr: 'Un événement mis à jour'
      });

    });

    it('an update of a draft without the draft option undrafts the event', async () => {
      const result = await core.agendas(agendaUid).events.update(draftEventUid, {
        title: {
          fr: 'La mort.'
        },
        description: {
          fr: 'Une desc'
        },
        location: {
          uid: 123
        },
        timings: [ {
          begin: new Date( '2019-05-06T10:00:00' ),
          end: new Date( '2019-05-06T11:00:00' )
        } ],
        keywords: {
          fr: [ 'un', 'deux', 'trois' ]
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [3, 4]
      });

      result.updated.draft.should.not.ok();

    });
  });

} );
