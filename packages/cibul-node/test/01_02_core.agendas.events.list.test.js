import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
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
];

describe('01 - core - functional (server): core.agendas().events.list()', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['001.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('default', () => {
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

    it('addMethod indicates event was referenced through a share', () => {
      expect(events[0].addMethod).toBe('share');
    });
  });

  describe('options', () => {
    describe('detailed: true', () => {
      let events;

      beforeAll(async () => {
        events = await core
          .agendas(2)
          .events.list(
            {},
            { limit: 1 },
            { detailed: true, access: 'internal' },
          );
      });

      it('requested event is returned directly by get', () => {
        expect(events[0].uid).toBe(1);
      });

      it('location is provided', () => {
        expect(Object.keys(events[0].location)).toEqual([
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
          'extId', // Legacy compatibility field added after formatting
          'specificite',
        ]);
      });

      it('origin agenda is provided', () => {
        expect(Object.keys(events[0].originAgenda)).toEqual([
          'locationSetUid',
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
          'private',
        ]);
      });

      it('member is provided', () => {
        expect(events[0].member).toEqual({
          role: 1,
          userUid: 1,
          name: 'Jan',
          email: null,
          invited: false,
          position: null,
          phone: null,
          organization: null,
          user: {
            culture: null,
            fullName: 'Janine P.',
            uid: 1,
          },
        });
      });

      it('user is provided', () => {
        expect(events[0].user.fullName).toBe('Janine P.');
      });

      it('sourceAgendas are provided', async () => {
        const twoEvents = await core
          .agendas(2)
          .events.list(
            {},
            { limit: 2 },
            { detailed: true, access: 'internal' },
          );
        expect(twoEvents[1].sourceAgendas.length).toBe(1);
      });

      it('canEdit and state are provided', () => {
        expect(typeof events[0].state).toBe('number');
        expect(typeof events[0].canEdit).toBe('boolean');
      });
    });

    describe('access', () => {
      it('if null is set on access, all additional fields are provided', async () => {
        const events = await core
          .agendas(2)
          .events.list({}, { limit: 1 }, { access: null });

        expect(events[0].thematique).toBe(2);
        expect(events[0].note).toBe(
          'Une note interne pour les administrateurs',
        );
      });

      it('if provided access value does not match set value in field, value is not provided', async () => {
        const events = await core
          .agendas(2)
          .events.list({}, { limit: 1 }, { access: 'moderator' });

        expect(events[0].note).toBeUndefined();
      });

      it('if provided access value matches field configuration, value is provided', async () => {
        const events = await core
          .agendas(2)
          .events.list({}, { limit: 1 }, { access: 'administrator' });

        expect(events[0].thematique).toBe(2);
        expect(events[0].note).toBe(
          'Une note interne pour les administrateurs',
        );
      });
    });

    describe('returnPayload: true', () => {
      let result;

      beforeAll(async () => {
        result = await core
          .agendas(2)
          .events.list({}, { limit: 1 }, { returnPayload: true });
      });

      it('success key is true when get is successful', () => {
        expect(result.success).toBe(true);
      });

      it('current agenda is available under agenda key', () => {
        expect(result.agenda.uid).toBe(2);
      });

      it('schema is available under formSchema key, with public fields, excluding id', () => {
        expect(
          result.formSchema.fields.filter(({ field }) => field === 'id').length,
        ).toBe(0);
      });

      it('event is provided in payload', () => {
        expect(result.events[0].slug).toBe('event-1');
      });
    });

    describe('returnPayload true and access defined', () => {
      let adminResult;
      let internalResult;

      beforeAll(async () => {
        adminResult = await core.agendas(2).events.list(
          {},
          { limit: 1 },
          {
            returnPayload: true,
            access: 'administrator',
          },
        );
        internalResult = await core.agendas(2).events.list(
          {},
          { limit: 1 },
          {
            returnPayload: true,
            access: 'internal',
          },
        );
      });

      it('admin field is provided in event', () => {
        expect(adminResult.events[0].note).toBe(
          'Une note interne pour les administrateurs',
        );
      });

      it('admin fields are given in schema', () => {
        expect(
          adminResult.formSchema.fields.filter(({ field }) =>
            ['thematique', 'note'].includes(field)).length,
        ).toBe(2);
      });

      it('event id is not provided if access is administrator', () => {
        expect(adminResult.events[0].id).toBeUndefined();
      });

      it('event id field is not provided if access is administrator', () => {
        expect(
          adminResult.formSchema.fields.filter(({ field }) => field === 'id')
            .length,
        ).toBe(0);
      });

      it('event id field is provided if access is internal', () => {
        expect(internalResult.events[0].id).toBe(1);
      });

      it('id field is present if formSchema if access is internal', () => {
        expect(
          internalResult.formSchema.fields.filter(({ field }) => field === 'id')
            .length,
        ).toBe(1);
      });
    });

    describe('load.valid true', () => {
      it('cannot load valid with other event parts', async () => {
        const error = await core
          .agendas(2)
          .events.list(
            { eventUid: 1 },
            { limit: 1 },
            { load: { valid: true, event: false } },
          )
          .then(
            () => null,
            (e) => e,
          );

        expect(error.message).toBe(
          'All data must be loaded to evaluate event validity',
        );
      });

      it('valid event', async () => {
        const [validEvent] = await core
          .agendas(2)
          .events.list(
            { eventUid: 1 },
            { limit: 1 },
            { load: { valid: true } },
          );

        expect(validEvent.valid).toBe(true);
      });

      it('invalid event', async () => {
        const [invalidEvent] = await core
          .agendas(2)
          .events.list(
            { eventUid: 7 },
            { limit: 1 },
            { load: { valid: true } },
          );

        expect(invalidEvent.valid).toBe(false);
      });
    });

    describe('other', () => {
      it('detailed list with admin access provides motive', async () => {
        const events = await core
          .agendas(1)
          .events.list({ state: null }, { limit: 10 });
        expect(events.find((e) => e.uid === 2).motive).toBe('>_>');
      });

      it('list can indicate addMethod to be contribution', async () => {
        const events = await core.agendas(1).events.list({}, { limit: 10 });
        expect(events.filter(({ uid }) => uid === 1).pop().addMethod).toBe(
          'contribution',
        );
      });

      it('list can indicate addMethod to be aggregation', async () => {
        const events = await core.agendas(2).events.list({}, { limit: 10 });
        expect(events.filter(({ uid }) => uid === 2).pop().addMethod).toBe(
          'aggregation',
        );
      });

      it('updatedAt is max between event & agenda_event records', async () => {
        const events = await core.agendas(2).events.list();

        expect(
          events
            .filter(({ uid }) => uid === 1)
            .pop()
            .updatedAt.getTime(),
        ).toBe(new Date('2022-06-30T09:00:00.000Z').getTime());
      });

      it('location tags are filtered according to schema legacy tagSet in list', async () => {
        const events = await core
          .agendas(2)
          .events.list(
            {},
            { limit: 1 },
            { detailed: true, access: 'internal' },
          );

        const event = events[0];
        expect(event.location.tags).toBeDefined();
        expect(Array.isArray(event.location.tags)).toBe(true);

        const validTag = event.location.tags.find((tag) => tag.id === 33);
        expect(validTag).toBeDefined();
        expect(validTag.label).toBe('Première participation');

        const invalidTag = event.location.tags.find((tag) => tag.id === 999);
        expect(invalidTag).toBeUndefined();
      });
    });
  });
});
