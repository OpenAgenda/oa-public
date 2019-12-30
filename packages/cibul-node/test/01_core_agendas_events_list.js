'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/01_core_agendas_events_get.sql');

const core = require('../core');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().events.list()', function() {
  this.timeout(20000);

  before(async () => {
    const con = mysql.createConnection(Object.assign( _.pick(testConfig.db, ['user', 'password']), {
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

  describe('simple list', () => {
    let events;

    before(async () => {
      events = await core.agendas(2).events.list({}, { limit: 1 });
    });

    it('list of events are provided as result', () => {
      events[0].uid.should.equal(1);
    });

    it('extended field is provided', () => {
      events[0].thematique.should.equal(2);
    });

    it('extended restricted access field is not provided', () => {
      should(events[0].note).equal(undefined);
    });

    it('location is not provided, just location uid', () => {
      should(events[0].location).equal(undefined);
      events[0].locationUid.should.equal(1);
    });

    it('origin agenda is not provided', () => {
      should(events[0].agenda).equal(undefined);
    });
  });

  describe('list with option detailed: true', () => {
    let events;

    before(async () => {
      events = await core.agendas(2).events.list({}, { limit: 1 }, { detailed: true });
    });

    it('requested event is returned directly by get', () => {
      events[0].uid.should.equal(1);
    });

    it('location is provided', () => {
      Object.keys(events[0].location).should.eql([
        'uid', 'slug', 'name', 'address',
        'city', 'region', 'department', 'postalCode',
        'insee', 'countryCode', 'district',
        'latitude', 'longitude', 'updatedAt'
      ]);
    });

    it('origin agenda is provided', () => {
      Object.keys(events[0].agenda).should.eql([
        'slug',
        'uid',
        'official',
        'title',
        'description',
        'url',
        'image',
        'updatedAt',
        'createdAt',
        'officializedAt',
        'private'
      ]);
    });

    it('member is provided', () => {
      events[0].member.should.eql({
        role: 1,
        userUid: 1,
        custom: {
          contactName: 'Jan'
        }
      });
    });
  });

  describe('list with access option', () => {
    it('if null is set on access, all extended fields are provided', async () => {
      const events = await core.agendas(2).events.list({}, { limit: 1 }, { access: null });

      events[0].thematique.should.equal(2);
      events[0].note.should.equal('Une note interne pour les administrateurs');
    });

    it('if provided access value does not match set value in field, value is not provided', async () => {
      const events = await core.agendas(2).events.list({}, { limit: 1 }, { access: 'moderator' });

      should(events[0].note).equal(undefined);
    });

    it('if provided access value matches field configuration, value is provided', async () => {
      const events = await core.agendas(2).events.list({}, { limit: 1 }, { access: 'administrator' });

      events[0].thematique.should.equal(2);
      events[0].note.should.equal('Une note interne pour les administrateurs');
    });
  });

  describe('list with option returnPayload: true', () => {
    let result;

    before(async () => {
      result = await core.agendas(2).events.list({}, { limit: 1 }, { returnPayload: true });
    });

    it('success key is true when get is successful', () => {
      result.success.should.equal(true);
    });

    it('current agenda is available under agenda key', () => {
      result.agenda.uid.should.equal(2);
    });

    it('schema is available under formSchema key, with public fields, excluding id', () => {
      result.formSchema.fields.filter(f => f.field === 'id').length.should.equal(0);
    });

    it('event is provided in payload', () => {
      result.events[0].slug.should.equal('event-1');
    });
  });

  describe('list with option returnPayload: true and access set', () => {
    let adminResult, internalResult;

    before(async () => {
      adminResult = await core.agendas(2).events.list({}, { limit: 1 }, {
        returnPayload: true,
        access: 'administrator'
      });
      internalResult = await core.agendas(2).events.list({}, { limit: 1 }, {
        returnPayload: true,
        access: 'internal'
      });
    });

    it('admin field is provided in event', () => {
      adminResult.events[0].note.should.equal('Une note interne pour les administrateurs');
    });

    it('admin fields are given in schema', () => {
      adminResult.formSchema.fields.filter(f => ['thematique', 'note'].includes(f.field)).length.should.equal(2);
    });

    it('event id is not provided if access is administrator', () => {
      should(adminResult.events[0].id).equal(undefined);
    });

    it('event id field is not provided if access is administrator', () => {
      adminResult.formSchema.fields.filter(f => f.field === 'id').length.should.equal(0);
    });

    it('event id field is provided if access is internal', () => {
      internalResult.events[0].id.should.equal(1);
    });

    it('id field is present if formSchema if access is internal', () => {
      internalResult.formSchema.fields.filter(f => f.field === 'id').length.should.equal(1);
    });
  });

});
