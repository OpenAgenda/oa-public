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

describe('core - functional (server): core.agendas().events.get()', function() {
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

  describe('simple get', () => {
    let event;

    before(async () => {
      event = await core.agendas(2).events.get(1);
    });


    it('requested event is returned directly by get', () => {
      event.uid.should.equal(1);
    });

    it('extended field is provided', () => {
      event.thematique.should.equal(2);
    });

    it('extended restricted access field is not provided', () => {
      should(event.note).equal(undefined);
    });

    it('location is not provided, just location uid', () => {
      should(event.location).equal(undefined);
      event.locationUid.should.equal(1);
    });

    it('origin agenda is provided', () => {
      should(event.agenda).eql({
        uid: 1,
        title: 'Une commune de Fraaance',
        slug: 'une-commune-de-fraaance',
        description: null,
        image: null,
        url: null
      });
      event
    });
  });

  describe('get with option detailed: true', () => {
    let event;

    before(async () => {
      event = await core.agendas(2).events.get(1, { detailed: true });
    });

    it('location is provided', () => {
      Object.keys(event.location).should.eql([
        'uid', 'slug', 'name', 'address',
        'city', 'region', 'department', 'postalCode',
        'insee', 'countryCode', 'district',
        'latitude', 'longitude', 'updatedAt'
      ]);
    });
  });

  describe('get with access option', () => {
    it('if null is set on access, all extended fields are provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: null });

      event.thematique.should.equal(2);
      event.note.should.equal('Une note interne pour les administrateurs');
    });

    it('if provided access value does not match set value in field, value is not provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: 'moderator' });

      should(event.note).equal(undefined);
    });

    it('if provided access value matches field configuration, value is provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: 'administrator' });

      event.thematique.should.equal(2);
      event.note.should.equal('Une note interne pour les administrateurs');
    });
  });

  describe('get with option returnPayload: true', () => {
    let result;

    before(async () => {
      result = await core.agendas(2).events.get(1, { returnPayload: true });
    });

    it('success key is true when get is successful', () => {
      result.success.should.equal(true);
    });

    it('current agenda is available under agenda key', () => {
      result.agenda.uid.should.equal(2);
    });

    it('origin agenda is available under originAgenda key', () => {
      result.originAgenda.uid.should.equal(1);
    });

    it('schema is available under formSchema key, with public fields, excluding id', () => {
      result.formSchema.fields.filter(f => f.field === 'id').length.should.equal(0);
    });

    it('event is provided in payload', () => {
      result.event.slug.should.equal('event-1');
    });
  });

  describe('get with option returnPayload: true and access set', () => {

    let adminResult, internalResult;

    before(async () => {
      adminResult = await core.agendas(2).events.get(1, {
        returnPayload: true,
        access: 'administrator'
      });
      internalResult = await core.agendas(2).events.get(1, {
        returnPayload: true,
        access: 'internal'
      });
    });

    it('admin field is provided in event', () => {
      adminResult.event.note.should.equal('Une note interne pour les administrateurs');
    });

    it('admin fields are given in schema', () => {
      adminResult.formSchema.fields.filter(f => ['thematique', 'note'].includes(f.field)).length.should.equal(2);
    });

    it('event id is not provided if access is administrator', () => {
      should(adminResult.event.id).equal(undefined);
    });

    it('event id field is not provided if access is administrator', () => {
      adminResult.formSchema.fields.filter(f => f.field === 'id').length.should.equal(0);
    });

    it('event id field is provided if access is internal', () => {
      internalResult.event.id.should.equal(1);
    });

    it('id field is present if formSchema if access is internal', () => {
      internalResult.formSchema.fields.filter(f => f.field === 'id').length.should.equal(1);
    });

  });

  describe('other', () => {

    it('get non-existing event returns null', async () => {
      should(await core.agendas(2).events.get(18978979)).equal(null);
    });

    it('get with customOnly option only gets custom data', async () => {
      const data = await core.agendas(2).events.get(1, {
        customOnly: true
      });

      data.should.eql({
        thematique: 2
      });
    });

    it('get with customOnly and access "administrator" options gets all custom data', async () => {
      const data = await core.agendas(2).events.get(1, {
        customOnly: true,
        access: 'administrator'
      });

      data.should.eql({
        thematique: 2,
        note: 'Une note interne pour les administrateurs'
      });
    });

  });

});
