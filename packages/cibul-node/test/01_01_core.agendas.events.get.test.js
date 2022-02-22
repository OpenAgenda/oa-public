'use strict';

const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().events.get()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '001.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'queues',
        'files',
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

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('simple get', () => {
    let event;

    beforeAll(async () => {
      event = await core.agendas(2).events.get(1);
    });

    it('requested event is returned directly by get', () => {
      expect(event.uid).toBe(1);
    });

    it('addMethod', () => {
      expect(event.addMethod).toBe('share');
    });

    it('additional field is provided', () => {
      expect(event.thematique).toBe(2);
    });

    it('additional restricted access field is not provided', () => {
      expect(event.note).toBeUndefined();
    });

    it('location is not provided, just location uid', () => {
      expect(event.location).toBeUndefined();
      expect(event.locationUid).toBe(1);
    });

    it('origin agenda is provided', () => {
      expect(event.originAgenda).toEqual({
        uid: 1,
        title: 'Une commune de Fraaance',
        description: 'Une description',
        slug: 'une-commune-de-fraaance',
        image: null,
        url: null
      });
    });
  });

  describe('get with option detailed: true', () => {
    let event;

    beforeAll(async () => {
      event = await core.agendas(2).events.get(1, { detailed: true });
    });

    it('location is provided', () => {
      expect(Object.keys(event.location)).toEqual([
        'uid', 'setUid', 'slug', 'name', 'address',
        'countryCode', 'adminLevel1', 'adminLevel2',
        'adminLevel3', 'city', 'adminLevel5',
        'district', 'postalCode', 'insee', 'latitude', 'longitude',
        'region', 'department', 'timezone',
        'updatedAt', 'createdAt', 'image', 'description', 'tags',
        'website', 'email', 'phone', 'links', 'access',
        'state', 'imageCredits', 'extId',
        'duplicateCandidates', 'disqualifiedDuplicates',
        'mergedIn', 'agendaUid'
      ]);
    });
  });

  describe('get with access option', () => {
    describe('access: null', () => {
      let event;

      beforeAll(async () => {
        event = await core.agendas(2).events.get(1, { access: null });
      });

      it('all additional fields are provided', async () => {
        expect(event.thematique).toEqual(2);
        expect(event.note).toEqual('Une note interne pour les administrateurs');
      });

      it('member is provided if detailed is true', async () => {
        expect(event.member.userUid).toEqual(1);
      });
    });

    describe('access: internal', () => {
      let event;

      beforeAll(async () => {
        event = await core.agendas(2).events.get(1, { access: 'internal' });
      });

      it('all additional fields are provided', async () => {
        expect(event.thematique).toBe(2);
        expect(event.note).toBe('Une note interne pour les administrateurs');
      });

      it('fix: fileKey is provided', async () => {
        expect(event.fileKey).toBe('31a7df7098744844b6c6ce0d2cdba0f4');
      });
    });

    describe('access: public', () => {
      let event;

      beforeAll(async () => {
        event = await core.agendas(2).events.get(1);
      });

      it('member is not provided', () => {
        expect(event.member).toBe(undefined);
      });
    });

    it('if provided access value does not match set value in field, value is not provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: 'moderator' });

      expect(event.note).toBe(undefined);
    });

    it('if provided access value matches field configuration, value is provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: 'administrator' });

      expect(event.thematique).toBe(2);
      expect(event.note).toBe('Une note interne pour les administrateurs');
    });

    it('administrator access includes event public fields in response', async () => {
      const event = await core.agendas(2).events.get(1, { access: 'administrator' });

      expect(event.locationUid).toBe(1);
    });
  });

  describe('get with option returnPayload: true', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(2).events.get(1, { returnPayload: true });
    });

    it('success key is true when get is successful', () => {
      expect(result.success).toEqual(true);
    });

    it('current agenda is available under agenda key', () => {
      expect(result.agenda.uid).toEqual(2);
    });

    it('origin agenda is available under originAgenda key', () => {
      expect(result.originAgenda.uid).toEqual(1);
    });

    it('schema is available under formSchema key, with public fields, excluding id', () => {
      expect(result.formSchema.fields.filter(f => f.field === 'id').length).toEqual(0);
    });

    it('event is provided in payload', () => {
      expect(result.event.slug).toEqual('event-1');
    });
  });

  describe('get with option returnPayload: true and access set', () => {
    let adminResult;
    let internalResult;

    beforeAll(async () => {
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
      expect(adminResult.event.note).toEqual('Une note interne pour les administrateurs');
    });

    it('admin fields are given in schema', () => {
      expect(adminResult.formSchema.fields.filter(f => ['thematique', 'note'].includes(f.field)).length).toEqual(2);
    });

    it('event id is not provided if access is administrator', () => {
      expect(adminResult.event.id).toEqual(undefined);
    });

    it('event id field is not provided if access is administrator', () => {
      expect(adminResult.formSchema.fields.filter(f => f.field === 'id').length).toEqual(0);
    });

    it('event id field is provided if access is internal', () => {
      expect(internalResult.event.id).toEqual(1);
    });

    it('creatorUid is provided if access is internal', () => {
      expect(internalResult.event.creatorUid).toEqual(1);
    });

    it('id field is present if formSchema if access is internal', () => {
      expect(internalResult.formSchema.fields.filter(f => f.field === 'id').length).toEqual(1);
    });
  });

  describe('get with longDescriptionFormat option', () => {
    let event;

    beforeAll(async () => {
      event = await core.agendas(2).events.get(2, {
        longDescriptionFormat: 'HTML'
      });
    });

    it('get returns longDescription in requested format', () => {
      expect(event.longDescription.fr).toContain('<p>');
    });
  });

  describe('other options', () => {
    it('useDateHoursMinutesFormat', async () => {
      const event = await core.agendas(2).events.get(1, {
        useDateHoursMinutesFormat: true
      });

      expect(
        Object.keys(event.timings[0].begin)
      ).toEqual(['date', 'hours', 'minutes']);
    });

    it('useLocationObjectFormat', async () => {
      const event = await core.agendas(2).events.get(1, {
        useLocationObjectFormat: true
      });

      expect(event.location).toEqual({ uid: 1 });
    });
  });

  describe('other', () => {
    it('get on event includes source paths', async () => {
      const ev = await core.agendas(2).events.get(2);

      expect(ev.sourcePaths).toEqual([[1]]);
    });

    it('source agendas are provided if detailed is true', async () => {
      const ev = await core.agendas(2).events.get(2, { detailed: true });
      expect(ev.sourceAgendas.length).toEqual(1);
    });

    it('get non-existing event returns null', async () => {
      expect(await core.agendas(2).events.get(18978979)).toBe(null);
    });

    it('get with customOnly option only gets custom data', async () => {
      const data = await core.agendas(2).events.get(1, {
        load: {
          custom: true
        }
      });

      expect(data).toEqual({
        thematique: 2
      });
    });

    it('get with customOnly and access "administrator" options gets all custom data', async () => {
      const data = await core.agendas(2).events.get(1, {
        load: {
          custom: true
        },
        access: 'administrator'
      });

      expect(data).toEqual({
        thematique: 2,
        note: 'Une note interne pour les administrateurs'
      });
    });
  });
});
