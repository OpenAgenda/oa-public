'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');

const assignClients = require('./utils/assignClients');
const fixtures = require('./fixtures/001.sql');

const Core = require('../core');
const Services = require('../services/init');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().events.list()', function() {
  let core;

  beforeAll(async () => {
    const con = mysql.createConnection(Object.assign( _.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
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

    core = Core(services, testConfig);
  });

  afterAll(() => {
    testConfig.knex.destroy();
    testConfig.redisClient.quit();
  });

  describe('simple list', () => {
    let events;

    beforeAll(async () => {
      events = await core.agendas(2).events.list({}, { limit: 1 });
    });

    it('list of events are provided as result', () => {
      expect(events[0].uid).toBe(1);
    });

    it('extended field is provided', () => {
      expect(events[0].thematique).toBe(2);
    });

    it('extended restricted access field is not provided', () => {
      expect(events[0].note).toBeUndefined();
    });

    it('location is not provided, just location uid', () => {
      expect(events[0].location).toBeUndefined();
      expect(events[0].locationUid).toBe(1);
    });

    it('origin agenda is not provided', () => {
      expect(events[0].originAgenda).toBeUndefined();
    });
  });

  describe('list with option detailed: true', () => {
    let events;

    beforeAll(async () => {
      events = await core.agendas(2).events.list({}, { limit: 1 }, { detailed: true });
    });

    it('requested event is returned directly by get', () => {
      expect(events[0].uid).toBe(1);
    });

    it('location is provided', () => {
      expect(Object.keys(events[0].location)).toEqual([
        'uid', 'slug', 'name', 'address',
        'city', 'region', 'department', 'postalCode',
        'insee', 'countryCode', 'district',
        'latitude', 'longitude', 'updatedAt',
        'createdAt', 'image', 'description', 'tags',
        'website', 'email', 'phone', 'links', 'access',
        'state', 'timezone', 'imageCredits', 'extId'
      ]);
    });

    it('origin agenda is provided', () => {
      expect(Object.keys(events[0].originAgenda)).toEqual([
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
      expect(events[0].member).toEqual({
        role: 1,
        userUid: 1,
        custom: {
          contactName: 'Jan'
        }
      });
    });

    it('sourceAgendas are provided', async () => {
      const events = await core.agendas(2).events.list({}, { limit: 2 }, { detailed: true });
      expect(events[1].sourceAgendas.length).toBe(1);
    });
  });

  describe('list with access option', () => {
    it('if null is set on access, all extended fields are provided', async () => {
      const events = await core.agendas(2).events.list({}, { limit: 1 }, { access: null });

      expect(events[0].thematique).toBe(2);
      expect(events[0].note).toBe('Une note interne pour les administrateurs');
    });

    it('if provided access value does not match set value in field, value is not provided', async () => {
      const events = await core.agendas(2).events.list({}, { limit: 1 }, { access: 'moderator' });

      expect(events[0].note).toBeUndefined();
    });

    it('if provided access value matches field configuration, value is provided', async () => {
      const events = await core.agendas(2).events.list({}, { limit: 1 }, { access: 'administrator' });

      expect(events[0].thematique).toBe(2);
      expect(events[0].note).toBe('Une note interne pour les administrateurs');
    });
  });

  describe('list with option returnPayload: true', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(2).events.list({}, { limit: 1 }, { returnPayload: true });
    });

    it('success key is true when get is successful', () => {
      expect(result.success).toBe(true);
    });

    it('current agenda is available under agenda key', () => {
      expect(result.agenda.uid).toBe(2);
    });

    it('schema is available under formSchema key, with public fields, excluding id', () => {
      expect(result.formSchema.fields.filter(f => f.field === 'id').length).toBe(0);
    });

    it('event is provided in payload', () => {
      expect(result.events[0].slug).toBe('event-1');
    });
  });

  describe('list with option returnPayload: true and access set', () => {
    let adminResult, internalResult;

    beforeAll(async () => {
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
      expect(adminResult.events[0].note).toBe('Une note interne pour les administrateurs');
    });

    it('admin fields are given in schema', () => {
      expect(
        adminResult.formSchema.fields.filter(f => ['thematique', 'note'].includes(f.field)).length
      ).toBe(2);
    });

    it('event id is not provided if access is administrator', () => {
      expect(adminResult.events[0].id).toBeUndefined();
    });

    it('event id field is not provided if access is administrator', () => {
      expect(adminResult.formSchema.fields.filter(f => f.field === 'id').length).toBe(0);
    });

    it('event id field is provided if access is internal', () => {
      expect(internalResult.events[0].id).toBe(1);
    });

    it('id field is present if formSchema if access is internal', () => {
      expect(internalResult.formSchema.fields.filter(f => f.field === 'id').length).toBe(1);
    });
  });

});
