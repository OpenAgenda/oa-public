import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.agendas().events.get()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '001.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'bull',
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
        'users',
        'keys',
      ],
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
        url: null,
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
        'uid',
        'setUid',
        'slug',
        'name',
        'address',
        'countryCode',
        'adminLevel1',
        'adminLevel2',
        'adminLevel3',
        'adminLevel4',
        'city',
        'adminLevel5',
        'district',
        'postalCode',
        'insee',
        'latitude',
        'longitude',
        'region',
        'department',
        'timezone',
        'updatedAt',
        'createdAt',
        'image',
        'description',
        'tags',
        'website',
        'email',
        'phone',
        'links',
        'access',
        'state',
        'imageCredits',
        'extIds',
        'duplicateCandidates',
        'disqualifiedDuplicates',
        'mergedIn',
        'agendaUid',
        'extId',
      ]);
    });

    it('location tags are filtered according to schema legacy tagSet', () => {
      expect(event.location.tags).toBeDefined();
      expect(Array.isArray(event.location.tags)).toBe(true);

      const validTag = event.location.tags.find((tag) => tag.id === 33);
      expect(validTag).toBeDefined();
      expect(validTag.label).toBe('Première participation');

      const invalidTag = event.location.tags.find((tag) => tag.id === 999);
      expect(invalidTag).toBeUndefined();
    });
  });

  describe('authorization', () => {
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

    describe('other', () => {
      it('if provided access value does not match set value in field, value is not provided', async () => {
        const event = await core
          .agendas(2)
          .events.get(1, { access: 'moderator' });

        expect(event.note).toBe(undefined);
      });

      it('if provided access value matches field configuration, value is provided', async () => {
        const event = await core
          .agendas(2)
          .events.get(1, { access: 'administrator' });

        expect(event.thematique).toBe(2);
        expect(event.note).toBe('Une note interne pour les administrateurs');
      });

      it('administrator access includes event public fields in response', async () => {
        const event = await core
          .agendas(2)
          .events.get(1, { access: 'administrator' });

        expect(event.locationUid).toBe(1);
      });
    });
  });

  describe('options', () => {
    describe('returnPayload true', () => {
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
        expect(
          result.formSchema.fields.filter(({ field }) => field === 'id').length,
        ).toEqual(0);
      });

      it('event is provided in payload', () => {
        expect(result.event.slug).toEqual('event-1');
      });
    });

    describe('load.valid', () => {
      it('get valid event', async () => {
        const { valid } = await core.agendas(2).events.get(1, {
          load: { valid: true },
        });
        expect(valid).toBe(true);
      });

      it('get invalid event', async () => {
        const { valid } = await core.agendas(2).events.get(7, {
          load: { valid: true },
        });
        expect(valid).toBe(false);
      });
    });

    describe('returnPayload true and access set', () => {
      let adminResult;
      let internalResult;

      beforeAll(async () => {
        adminResult = await core.agendas(2).events.get(1, {
          returnPayload: true,
          access: 'administrator',
        });
        internalResult = await core.agendas(2).events.get(1, {
          returnPayload: true,
          access: 'internal',
        });
      });

      it('admin field is provided in event', () => {
        expect(adminResult.event.note).toEqual(
          'Une note interne pour les administrateurs',
        );
      });

      it('admin fields are given in schema', () => {
        expect(
          adminResult.formSchema.fields.filter(({ field }) =>
            ['thematique', 'note'].includes(field)).length,
        ).toEqual(2);
      });

      it('event id is not provided if access is administrator', () => {
        expect(adminResult.event.id).toEqual(undefined);
      });

      it('event id field is not provided if access is administrator', () => {
        expect(
          adminResult.formSchema.fields.filter(({ field }) => field === 'id')
            .length,
        ).toEqual(0);
      });

      it('event id field is provided if access is internal', () => {
        expect(internalResult.event.id).toEqual(1);
      });

      it('creatorUid is provided if access is internal', () => {
        expect(internalResult.event.creatorUid).toEqual(1);
      });

      it('id field is present if formSchema if access is internal', () => {
        expect(
          internalResult.formSchema.fields.filter(({ field }) => field === 'id')
            .length,
        ).toEqual(1);
      });
    });

    describe('longDescriptionFormat', () => {
      let event;

      beforeAll(async () => {
        event = await core.agendas(2).events.get(2, {
          longDescriptionFormat: 'HTML',
        });
      });

      it('get returns longDescription in requested format', () => {
        expect(event.longDescription.fr).toContain('<p>');
      });
    });

    describe('other', () => {
      it('useDateHoursMinutesFormat', async () => {
        const event = await core.agendas(2).events.get(1, {
          useDateHoursMinutesFormat: true,
        });

        expect(Object.keys(event.timings[0].begin)).toEqual([
          'date',
          'hours',
          'minutes',
        ]);
      });

      it('useLocationObjectFormat', async () => {
        const event = await core.agendas(2).events.get(1, {
          useLocationObjectFormat: true,
        });

        expect(event.location).toEqual({ uid: 1 });
      });
    });
  });

  describe('other', () => {
    it('motive of refused event is provided by get', async () => {
      const ev = await core.agendas(1).events.get(2);

      expect(ev.motive).toBe('>_>');
      expect(ev.state).toBe(-1);
    });

    it('extIds of event is provided by detailed get', async () => {
      const ev = await core.agendas(1).events.get(6, { detailed: true });
      expect(ev.extIds).toStrictEqual([{ key: 'test', value: '1234' }]);
    });

    it('updatedAt value is latest between event and agenda_event record', async () => {
      const ev = await core.agendas(2).events.get(1);

      expect(ev.updatedAt.getTime()).toBe(
        new Date('2022-06-30T09:00:00.000Z').getTime(),
      );
    });

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

    it('get existing event but not referenced on agenda returns null', async () => {
      expect(await core.agendas(1).events.get(18978979)).toBe(null);
    });

    it('get existing event with payload but not referenced on agenda returns null on event reference', async () => {
      expect(
        await core
          .agendas(1)
          .events.get(18978979, { returnPayload: true })
          .then((r) => r.event),
      ).toBe(null);
    });

    it('get with load.custom option only gets custom data', async () => {
      const data = await core.agendas(2).events.get(1, {
        load: {
          default: false,
          custom: true,
        },
      });

      expect(data).toEqual({
        thematique: 2,
      });
    });

    it('get with load.custom option only and access "administrator" options gets all custom data', async () => {
      const data = await core.agendas(2).events.get(1, {
        load: {
          default: false,
          custom: true,
        },
        access: 'administrator',
      });

      expect(data).toEqual({
        thematique: 2,
        note: 'Une note interne pour les administrateurs',
      });
    });
  });
});
