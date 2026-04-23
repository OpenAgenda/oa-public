import fs from 'node:fs';
import _ from 'lodash';
import ky from 'ky';
import ih from 'immutability-helper';
import api from '../api/index.js';
import Core from '../core/index.js';
import Services from '../services/init.js';
import eventsFixtures from './fixtures/events/index.js';
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
  'aggregators',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'keys',
  'accessTokens',
  'tracker',
  'images',
  'files',
  'imageFiles',
];

describe('core - functional (server): core.agendas().events.create()', () => {
  let core;

  const config = testConfig.extendWith({
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_events_create',
    },
  });

  const now = new Date();
  const inAnHour = new Date();
  inAnHour.setHours(inAnHour.getHours() + 1);

  const basicEventData = {
    title: {
      fr: 'Titre',
    },
    description: {
      fr: 'Desc',
    },
    timings: [
      {
        begin: now,
        end: inAnHour,
      },
    ],
    location: {
      uid: 123,
    },
  };

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['002.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.formSchemas.clearCache();

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(17026855).events.search.rebuild();
  });

  afterAll(() => core.services.simpleCache.clearAll());
  afterAll(() => core.services.formSchemas.clearCache());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    describe('simple', () => {
      let event;

      const memberUserUid = 63170203;

      beforeAll(async () => {
        event = await core.agendas(17026855).events.create(
          {
            title: {
              fr: 'Un événement',
            },
            description: {
              fr: 'Test de la lib core',
            },
            timings: [
              {
                begin: new Date('2019-05-06T10:00:00'),
                end: new Date('2019-05-06T11:00:00'),
              },
            ],
            keywords: {
              fr: ['un', 'deux', 'trois'],
            },
            location: {
              uid: 123,
            },
            accessibility: { ii: true },
            'categories-agenda-metropolitain': 42,
            'thematiques-bordeaux-metropole': [3, 4],
          },
          {
            context: {
              userUid: memberUserUid,
            },
            access: 'contributor',
          },
        );
      });

      describe('response', () => {
        it('created event is provided in response', () => {
          expect(event.slug).toBe('un-evenement');
        });

        it('created event internal fields are not provided (id)', () => {
          expect(event.id).toBeUndefined();
        });
      });

      describe('persistence', () => {
        it('contributing member is associated to event', async () => {
          const ae = await core.services.agendaEvents(17026855).get(event.uid);

          expect(ae.userUid).toBe(63170203);
        });

        it('event owner is contributing member', async () => {
          const eventSvcEvent = await core.services.events.get(event.uid, {
            access: 'internal',
          });

          expect(eventSvcEvent.ownerUid).toBe(63170203);
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

        it('event is not marked as private', async () => async () => {
          const entry = await core.services
            .knex('event_2')
            .first(['private'])
            .where('uid', event.uid);

          expect(!!entry.private).toBe(false);
        });

        it('accessibility is saved in event', async () => {
          expect(event.accessibility).toEqual({
            mi: false,
            hi: false,
            pi: false,
            vi: false,
            ii: true,
          });
        });
      });

      describe('search', () => {
        let result;

        beforeAll(async () => {
          try {
            result = await core.agendas(17026855).events.search(
              {
                uid: event.uid,
              },
              {},
              {
                detailed: true,
                access: 'administrator',
              },
            );
          } catch (e) {
            /* console.log(JSON.stringify(e.meta.body, null, 2)); */
          }
        });

        it('event is retrieved by its uid', async () => {
          expect(result.total).toBe(1);

          expect(result.events[0].uid).toBe(event.uid);
        });

        it('indexed member name is user name when member name is not defined', () => {
          expect(result.events[0].member.name).toBe('steve');
        });
      });
    });

    describe('options', () => {
      describe('returnPayload: true', () => {
        let result;

        beforeAll(async () => {
          result = await core.agendas(17026855).events.create(
            {
              title: {
                fr: 'Un événement',
              },
              description: {
                fr: 'Test de la lib core',
              },
              timings: [
                {
                  begin: new Date('2019-05-06T10:00:00'),
                  end: new Date('2019-05-06T11:00:00'),
                },
              ],
              location: {
                uid: 123,
              },
              'categories-agenda-metropolitain': 42,
              'thematiques-bordeaux-metropole': [3, 4],
            },
            {
              context: {
                userUid: 46863451,
              },
              returnPayload: true,
              access: 'contributor',
            },
          );
        });

        it('agenda formSchema is provided in result', () => {
          expect(Object.keys(result.formSchema)).toEqual(['custom', 'fields']);
        });

        it('fields with moderator as access are not provided in schema when provided access is contributor', () => {
          expect(
            result.formSchema.fields.filter(
              (f) => f.field === 'custom_description',
            ).length,
          ).toBe(0);
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
          expect(result.member.userUid).toBe(46863451);
        });

        it('agenda is part payload', () => {
          expect(result.agenda.uid).toBe(17026855);
        });
      });

      describe('returnPayload: true, access:moderator', () => {
        let result;

        beforeAll(async () => {
          result = await core.agendas(17026855).events.create(
            {
              title: {
                fr: 'Un événement',
              },
              description: {
                fr: 'Test de la lib core',
              },
              timings: [
                {
                  begin: new Date('2019-05-06T10:00:00'),
                  end: new Date('2019-05-06T11:00:00'),
                },
              ],
              'categories-agenda-metropolitain': 42,
              location: {
                uid: 123,
              },
            },
            {
              context: {
                userUid: 63170200,
              },
              returnPayload: true,
              access: 'moderator',
            },
          );
        });

        it('field with "moderator" in read parameter are provided in result', () => {
          expect(
            result.formSchema.fields.filter(
              (f) => f.field === 'custom_description',
            ).length,
          ).toBe(1);
        });
      });
    });

    describe('particular contexts', () => {
      describe('states', () => {
        it('create on agenda with published default state creates published event', async () => {
          const event = await core.agendas(17026855).events.create(
            {
              ...basicEventData,
              'categories-agenda-metropolitain': 42,
            },
            {
              context: { userUid: 63170200 },
              access: 'contributor',
            },
          );

          expect(event.state).toBe(2);
        });

        it('create on agenda with to moderate default state creates to moderate event', async () => {
          const event = await core
            .agendas(55268170)
            .events.create(basicEventData, {
              access: 'contributor',
            });

          expect(event.state).toBe(0);
        });

        it('create with contributor access can not force state', async () => {
          let error;
          try {
            await core.agendas(55268170).events.create(
              {
                title: { fr: 'T' },
                description: { fr: 'D' },
                timings: [{ begin: now, end: inAnHour }],
                location: { uid: 123 },
                state: 2,
              },
              {
                access: 'contributor',
              },
            );
          } catch (e) {
            error = e;
          }
          expect(error.message).toBe('not authorized to publish events');
        });

        it('create with "administrator" access can explicit state', async () => {
          const event = await core.agendas(55268170).events.create(
            {
              title: { fr: 'T' },
              description: { fr: 'D' },
              timings: [{ begin: now, end: inAnHour }],
              location: { uid: 123 },
              state: 2,
            },
            {
              access: 'administrator',
            },
          );

          expect(event.state).toBe(2);
        });
      });

      describe('status', () => {
        it('create on agenda with published default state creates published event', async () => {
          const event = await core.agendas(17026855).events.create(
            {
              ...basicEventData,
              status: 3,
              timings: [
                {
                  begin: new Date('2021-05-28T12:00:00+0100'),
                  end: new Date('2021-05-28T14:00:00+0100'),
                },
              ],
              'categories-agenda-metropolitain': 42,
            },
            {
              context: { userUid: 63170200 },
              access: 'contributor',
            },
          );

          expect(event.status).toBe(3);
        });
      });

      describe('private agenda', () => {
        let event;

        const agendaUid = 81989389;
        const memberUserUid = 37892739;

        beforeAll(async () => {
          event = await core.agendas(agendaUid).events.create(
            {
              title: {
                fr: 'Un événement privé',
              },
              description: { fr: 'D' },
              timings: [
                {
                  begin: new Date('2021-05-28T12:00:00+0100'),
                  end: new Date('2021-05-28T14:00:00+0100'),
                },
              ],
              location: { uid: 123 },
            },
            {
              userUid: memberUserUid,
            },
          );
        });

        it('event is marked as private', () => {
          expect(event.private).toBe(true);
        });
      });

      describe('online event', () => {
        let event;

        const memberUserUid = 63170200;
        const agendaUid = 17026855;

        beforeAll(async () => {
          event = await core.agendas(agendaUid).events.create(
            {
              title: {
                fr: 'Un événement en ligne',
              },
              attendanceMode: 2,
              onlineAccessLink: 'https://openagenda.com',
              description: { fr: 'Voilà' },
              timings: [
                {
                  begin: new Date('2021-05-28T12:00:00+0100'),
                  end: new Date('2021-05-28T14:00:00+0100'),
                },
              ],
              'categories-agenda-metropolitain': 42,
            },
            {
              context: {
                userUid: memberUserUid,
              },
              detailed: 1,
              access: 'moderator',
            },
          );
        });

        it('online event was created and is online', () => {
          expect(event.attendanceMode).toBe(2);
        });
      });

      describe('draft', () => {
        let event;

        const memberUserUid = 63170200;
        const agendaUid = 17026855;

        beforeAll(async () => {
          event = await core.agendas(agendaUid).events.create(
            {
              title: {
                fr: 'Un événement brouillon',
              },
              custom_description: ":')",
              draft: true,
            },
            {
              context: {
                userUid: memberUserUid,
              },
              access: 'moderator',
            },
          );
        });

        it('incomplete event can be saved', () => {
          expect(event.draft).toBe(true);
        });

        it('draft event is not referenced in agenda', async () => {
          const ae = await core.services.agendaEvents(agendaUid).get(event.uid);

          expect(ae).toBeNull();
        });

        it('incomplete event with default location data and undefined location can be saved', async () => {
          const incompleteEvent = await core.agendas(agendaUid).events.create(
            {
              title: {
                fr: 'Un autre événement brouillon',
              },
              location: {
                countryCode: 'CH',
              },
              draft: true,
            },
            {
              context: {
                userUid: memberUserUid,
              },
            },
          );

          expect(incompleteEvent.title.fr).toEqual(
            'Un autre événement brouillon',
          );
        });

        it('custom data is stored even if incomplete', async () => {
          const data = await core.services.custom(2).get(event.uid);

          expect(data).toEqual({
            custom_description: ":')",
          });
        });

        it('draft event without title can be created', async () => {
          const noTitleDraft = await core.agendas(agendaUid).events.create(
            {
              description: {
                fr: 'Un brouillon sans titre',
              },
              draft: true,
            },
            {
              context: {
                userUid: memberUserUid,
              },
            },
          );

          expect(noTitleDraft.title).toBeUndefined();
        });
      });

      describe('location tag filtering', () => {
        let event;

        const memberUserUid = 63170200;
        const agendaUid = 17026855;

        beforeAll(async () => {
          event = await core.agendas(agendaUid).events.create(
            {
              title: {
                fr: 'Un événement avec filtrage de tags',
              },
              description: {
                fr: 'Test du filtrage des tags de localisation',
              },
              timings: [
                {
                  begin: new Date('2021-05-28T12:00:00+0100'),
                  end: new Date('2021-05-28T14:00:00+0100'),
                },
              ],
              location: {
                uid: 123,
              },
              'categories-agenda-metropolitain': 42,
            },
            {
              context: {
                userUid: memberUserUid,
              },
              detailed: true,
              access: 'moderator',
            },
          );
        });

        it('location tags are filtered according to schema legacy tagSet', () => {
          expect(event.location).toBeDefined();
          expect(event.location.tags).toBeDefined();
          expect(Array.isArray(event.location.tags)).toBe(true);

          const validTag = event.location.tags.find((tag) => tag.id === 33);
          expect(validTag).toBeDefined();
          expect(validTag.label).toBe('Première participation');

          const invalidTag = event.location.tags.find((tag) => tag.id === 999);
          expect(invalidTag).toBeUndefined();
        });
      });

      describe('duplicate', () => {
        let originEvent;
        let duplicateEvent;
        const memberUserUid = 63170203;
        const agendaUid = 17026855;

        beforeAll(async () => {
          originEvent = await core.agendas(agendaUid).events.create(
            {
              title: {
                fr: 'Origine',
              },
              description: {
                fr: 'Test de la lib core',
              },
              timings: [
                {
                  begin: new Date('2023-02-14T10:00:00'),
                  end: new Date('2023-02-14T12:00:00'),
                },
              ],
              image: {
                url: 'https://cdn.openagenda.com/main/eed1137a9bd146f0ae7f28668e5a1052.full.image.jpg',
              },
              attendanceMode: 2,
              onlineAccessLink: 'https://oa.com',
              'categories-agenda-metropolitain': 42,
            },
            {
              context: {
                userUid: memberUserUid,
              },
              access: 'contributor',
            },
          );

          duplicateEvent = await core
            .agendas(agendaUid)
            .events.create(_.omit(originEvent, ['state', 'links']), {
              context: {
                userUid: memberUserUid,
              },
              access: 'contributor',
              duplicateOrigin: {
                agendaUid,
                eventUid: originEvent.uid,
              },
            });
        });

        it('origin event image name derives from event fileKey', () => {
          expect(
            originEvent.image.filename.match(originEvent.fileKey),
          ).toBeTruthy();
        });

        it('duplicate fileKey differs from origin fileKey', () => {
          expect(originEvent.fileKey).not.toBe(duplicateEvent.fileKey);
        });

        it('duplicate event image name derives from duplicate fileKey', () => {
          expect(
            duplicateEvent.image.filename.match(duplicateEvent.fileKey),
          ).toBeTruthy();
        });
      });

      describe('conditional required field', () => {
        test('when ref field is not specified, enabled with required field is not processed', async () => {
          const createdEvent = await core.agendas(89904399).events.create(
            {
              ...basicEventData,
              image: undefined,
            },
            {
              userUid: 37892739,
            },
          );

          expect(createdEvent).toBeDefined();
        });

        test('when ref field is specified, enableWith required field triggers validation error when not set', async () => {
          const { error } = await core
            .agendas(89904399)
            .events.create(
              {
                ...basicEventData,
                image: {
                  url: 'https://openagenda.com/images/openagenda.png',
                },
              },
              {
                userUid: 37892739,
              },
            )
            .then(
              (event) => ({ event }),
              (e) => ({ error: e }),
            );

          expect(error.info.errors[0]).toEqual({
            code: 'required',
            field: 'image-droits',
            message: 'a boolean is required',
            origin: undefined,
            step: 'validation',
          });
        });

        test('when ref field is specified, enableWith required field has to be specified', async () => {
          const { error } = await core
            .agendas(89904399)
            .events.create(
              {
                ...basicEventData,
                image: {
                  url: 'https://openagenda.com/images/openagenda.png',
                },
                'images-droits': true,
              },
              {
                userUid: 37892739,
              },
            )
            .then(
              (event) => ({ event }),
              (e) => ({ error: e }),
            );

          expect(error.info.errors[0]).toEqual({
            code: 'required',
            field: 'image-droits',
            message: 'a boolean is required',
            origin: undefined,
            step: 'validation',
          });
        });
      });
    });

    describe('data format variations', () => {
      let event;

      beforeAll(async () => {
        event = await core.agendas(17026855).events.create(
          {
            title: {
              fr: 'Un événement',
            },
            description: {
              fr: "Autre format d'horaires",
            },
            longDescription: {
              fr: '<div>Le jardin 56, Ville de Paris, la DEVE, Paris Habitat, guide nature grand Paris,&nbsp; les Randos de Camille... vous proposent quatre rendez-vous, avec des thématiques différentes.</div><blockquote><ol><li><div><span style="font-size:18px;"><span class="wixui-rich-text__text">Découverte des fleurs printanières et éveil du sous-bois en mars</span></span></div></li><li><div><span style="font-size:18px;"><span class="wixui-rich-text__text">Pollinisation et sexualité des plantes en mai</span></span></div></li><li><div><span style="font-size:18px;"><span class="wixui-rich-text__text">Plantes potagères et sauvages oubliées en septembre</span></span></div></li><li><div><span style="font-size:18px;"><span class="wixui-rich-text__text">Plantes sauvages à tous les étages en octobre</span></span></div></li></ol></blockquote><p>Durée : 1h30</p><p>Activité organisée par Nathalie - guide nature qualinat et paysagiste</p><p>Infos et réservation sur <a href="https://www.eco-nature.org/experience/decouverte-des-jardins-du-20e">EcoNature : https://www.eco-nature.org/experience/decouverte-des-jardins-du-20e</a></p>',
            },
            image: {
              url: 'https://openagenda.com/images/openagenda.png',
            },
            timings: [
              {
                begin: {
                  date: '2019-12-06',
                  hours: 11,
                  minutes: 23,
                },
                end: {
                  date: '2019-12-06',
                  hours: 11,
                  minutes: 50,
                },
              },
            ],
            'categories-agenda-metropolitain': 42,
            location: {
              uid: 123,
            },
          },
          {
            context: {
              userUid: 63170200,
            },
            access: 'contributor',
          },
        );
      });

      it('event is created with timings provided in non Date format', () => {
        expect(event.title.fr).toBe('Un événement');
      });

      it('timings is saved in Date format', () => {
        expect(event.timings[0].begin).toBe('2019-12-06T11:23:00.000+01:00');
      });

      it('long description is converted to markdown when HTML was provided', () => {
        expect(event.longDescription.fr.indexOf('<div>')).toBe(-1);
      });
    });

    describe('errors and exceptions', () => {
      const validData = {
        title: {
          fr: 'Un événement',
        },
        description: {
          fr: 'Un tout petit événement',
        },
        timings: [
          {
            begin: new Date('2019-05-06T10:00:00'),
            end: new Date('2019-05-06T11:00:00'),
          },
        ],
        location: {
          uid: 123,
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole': [3, 4],
      };

      const options = {
        context: {
          userUid: 63170200,
        },
        access: 'contributor',
      };

      it('something about a validation error', async () => {
        let error;
        try {
          await core.agendas(17026855).events.create(
            ih(validData, {
              $unset: ['title'],
            }),
            options,
          );
        } catch (e) {
          error = e;
        }
        expect(error.info.errors[0]).toEqual({
          lang: 'fr',
          field: 'title',
          code: 'required',
          message: 'a string is required',
          origin: '',
          step: 'validation',
        });
      });

      it('create with location uid matching no location returns validation error', async () => {
        let error;
        try {
          await core.agendas(17026855).events.create(
            ih(validData, {
              location: {
                $set: { uid: 124 },
              },
            }),
            options,
          );
        } catch (e) {
          error = e;
        }

        expect(error.info.errors).toEqual([
          {
            field: 'location',
            code: 'invalid',
            message: 'provided location uid is invalid',
            origin: undefined,
            step: 'validation',
          },
        ]);
      });

      it('create with invalid language code provoques validation error on languages', async () => {
        let error;
        try {
          await core.agendas(17026855).events.create(
            {
              ...validData,
              title: {
                '"fr"': 'Malformed language code',
              },
              description: {
                '"fr"': 'Malformed language code',
              },
            },
            options,
          );
        } catch (e) {
          error = e;
        }
        expect(error.info.errors[0]).toEqual({
          origin: '"fr"',
          code: 'lang.invalid',
          message: 'lang code should be 2 [a-z] characters',
          values: { min: 2, max: 2 },
          field: 'title',
          step: 'validation',
        });
      });

      it('create without specified location returns validation error', async () => {
        let error;
        try {
          await core.agendas(17026855).events.create(
            ih(validData, {
              $unset: ['location'],
            }),
            options,
          );
        } catch (e) {
          error = e;
        }
        expect(error.info.errors).toEqual([
          {
            code: 'location.required',
            message: 'a integer is required',
            origin: undefined,
            field: 'location',
            step: 'validation',
          },
        ]);
      });

      it('create with locationUid specified as null string', async () => {
        let error;
        try {
          await core.agendas(17026855).events.create(
            {
              title: 'Reconnexion à Chêne-Bourg',
              description: 'Reconnexion à Chêne-Bourg',
              keywords: '',
              longDescription:
                "La BioSphère s'implante à Chêne-Bourg\n\nPorté par une vision artistique et sensorielle, un dôme géodésique inédit (BioSphère) ouvre notre horizon.\nUne installation proposée par le Muséum et le Canton de Genève, en partenariat avec la Maison du Salève, ProNatura Genève, SIG et la commune de Chêne-Bourg.\n\nProgramme détaillé: www.reconnexions-mhng.ch\n\nAvec notamment les soirées culturelles\nInfos pratiques:\n19h - 22h30\nEsplanade de la Gare Léman Express\nTout public\nGratuit, inscriptions OBLIGATOIRES sur le site: www.reconnexions-mhng.ch\n\nDates des soirées culturelles:\n- Vendredi 2 octobre\n- Jeudi 8 octobre\n- Jeudi 15 octobre\n- Jeudi 22 octobre\n- Mercredi 28 octobre\n- Jeudi 29 octobre\n- Jeudi 5 novembre\n- Jeudi 12 novembre\n[Plus d'information sur le site de l'organisateur](http://institutions.ville-geneve.ch/index.php?id=9515)",
              locationUid: 'null',
              'categories-agenda-metropolitain': 42,
              'thematiques-bordeaux-metropole': [3, 4],
              timings: [
                {
                  begin: '2020-10-02T00:00:00+0200',
                  end: '2020-11-19T00:00:00+0100',
                },
                {
                  begin: '2020-10-03T00:00:00+0200',
                  end: '2020-11-20T00:00:00+0100',
                },
              ],
              image: {
                url: 'http://institutions.ville-geneve.ch/uploads/media/Reconnexion980.jpg',
              },
              imageCredits: 'DR',
              image_alt_text: 'Textealternatif',
              conditions: '',
              accessibility: {},
            },
            options,
          );
        } catch (e) {
          error = e;
        }
        expect(error.name).toBe('BadRequest');
      });
    });
  });

  describe('api', () => {
    let server;
    let accessToken;
    let response;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const tokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    describe('successful create', () => {
      beforeAll(async () => {
        try {
          response = await ky
            .post('http://localhost:4000/agendas/17026855/events', {
              headers: {
                'access-token': accessToken,
              },
              json: {
                title: {
                  FR: 'Un événement créé par API',
                },
                description: {
                  FR: 'Un tout petit événement',
                },
                image: {
                  url: 'https://cdn.openagenda.com/main/event_a-l-abordage-la-nouvelle-exposition-du-conservatoire-du-jeu-de-societe-au-centre-national-du-jeu_734952.jpg',
                  credits: 'Les crédits',
                },
                timings: [
                  {
                    begin: new Date('2019-05-06T10:00:00'),
                    end: new Date('2019-05-06T11:00:00'),
                  },
                ],
                keywords: {
                  FR: ['un', 'deux', 'trois'],
                },
                location: {
                  uid: 123,
                },
                'categories-agenda-metropolitain': 42,
                'thematiques-bordeaux-metropole': [3, 4],
                accessibility: { sl: true },
              },
            })
            .json();
        } catch (e) {
          console.log(e.response.data);
        }
      });

      it('image is uploaded to cdn when provided by url', async () => {
        const url = response.event.image.base + response.event.image.filename;

        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) {
          throw new Error(`HEAD ${url} → ${res.status}`);
        }

        const lastModified = res.headers.get('last-modified');
        const sinceLastModified = Date.now() - new Date(lastModified).getTime();

        expect(sinceLastModified).toBeLessThan(10_000);
      });

      it('response gives success key at true if creation was a success', () => {
        expect(response.success).toBe(true);
      });

      it('response provides created event in event key', () => {
        expect(response.event.slug).toBe('un-evenement-cree-par-api');
      });

      it('countryCode is cleaned and smallcased for multilingual values', () => {
        expect(Object.keys(response.event.title)).toEqual(['fr']);
      });

      it('backwards compatibility: credits placed in image.credits are moved to imageCredits', () => {
        expect(response.event.imageCredits).toBe('Les crédits');
      });

      it('create with fetch', async () => {
        const form = new FormData();
        form.append(
          'data',
          JSON.stringify(_.omit(eventsFixtures[3], ['state'])),
        );

        const createResponse = await fetch(
          'http://localhost:4000/agendas/17026855/events?key=',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'access-token': accessToken,
            },
            body: form,
          },
        );

        const body = await createResponse.json();

        expect(body.success).toBe(true);
      });

      it('create online event', async () => {
        const onlineEventCreateResponse = await ky
          .post('http://localhost:4000/agendas/17026855/events', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              title: {
                fr: 'Un événement créé par API',
              },
              description: {
                fr: 'Un tout petit événement',
              },
              image: {
                url: 'https://cdn.openagenda.com/main/event_a-l-abordage-la-nouvelle-exposition-du-conservatoire-du-jeu-de-societe-au-centre-national-du-jeu_734952.jpg',
                credits: 'Les crédits',
              },
              timings: [
                {
                  begin: new Date('2019-05-06T10:00:00'),
                  end: new Date('2019-05-06T11:00:00'),
                },
              ],
              keywords: {
                fr: ['un', 'deux', 'trois'],
              },
              attendanceMode: 2,
              onlineAccessLink: 'https://openagenda.com',
              'categories-agenda-metropolitain': 42,
              'thematiques-bordeaux-metropole': [3, 4],
              accessibility: { sl: true },
            },
          })
          .json();

        expect(onlineEventCreateResponse.event.attendanceMode).toBe(2);
      });

      it('create event with invalid url provided in image', async () => {
        let error;
        try {
          await ky
            .post('http://localhost:4000/agendas/17026855/events', {
              headers: {
                'access-token': accessToken,
              },
              json: {
                title: {
                  fr: 'Un événement créé par API',
                },
                description: {
                  fr: 'Un tout petit événement',
                },
                image: {
                  url: 'https://cdn.openagenda.com/main/event_a-l-abo',
                  credits: 'Les crédits',
                },
                timings: [
                  {
                    begin: new Date('2019-05-06T10:00:00'),
                    end: new Date('2019-05-06T11:00:00'),
                  },
                ],
                attendanceMode: 2,
                onlineAccessLink: 'https://openagenda.com',
                'categories-agenda-metropolitain': 42,
                'thematiques-bordeaux-metropole': [3, 4],
              },
            })
            .json();
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(400);
        const errorData = await error.response.json();
        expect(errorData.errors).toEqual([
          {
            field: 'image',
            code: 'url.invalid',
            fieldLabel: 'Image of the event',
            message: 'provided image url is not valid',
          },
        ]);
      });

      it('contributor may not set state through api', async () => {
        const url = 'http://localhost:4000/agendas/17026855/events?key';

        const form = new FormData();
        form.append('data', JSON.stringify(eventsFixtures[3]));

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'access-token': accessToken,
          },
          body: form,
        });

        expect(res.status).toBe(403);

        const body = await res.json();
        expect(body.message).toBe('not authorized to publish events');
      });
    });

    describe('create with one language in input and with a file attached', () => {
      let oneLanguageResponse;

      const data = {
        title: 'Un autre événement créé par API',
        description: 'Un tout petit événement',
        timings: [
          {
            begin: new Date('2019-05-06T10:00:00'),
            end: new Date('2019-05-06T11:00:00'),
          },
        ],
        keywords: ['un', 'deux', 'trois'],
        location: {
          uid: 123,
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole': [3, 4],
        accessibility: { sl: true },
      };

      beforeAll(
        () =>
          new Promise((rs) => {
            fs.createReadStream(`${import.meta.dirname}/fixtures/pirates.jpg`)
              .pipe(fs.createWriteStream('/tmp/pirates.jpg'))
              .on('close', rs);
          }),
      );

      beforeAll(async () => {
        try {
          const form = new FormData();

          form.append(
            'image',
            await fs.openAsBlob('/tmp/pirates.jpg'),
            'pirates.jpg',
          );
          form.append('access_token', accessToken);
          form.append('data', JSON.stringify(data));

          oneLanguageResponse = await fetch(
            'http://localhost:4000/agendas/17026855/events',
            {
              method: 'POST',
              body: form,
              headers: {
                Accept: 'application/json',
              },
            },
          ).then((res) => res.json());
        } catch (e) {
          /* console.log(JSON.stringify(e, null, 2)); */
        }
      });

      it('Event is created in english if lang is not specified', async () => {
        expect(oneLanguageResponse.event.title).toEqual({
          en: 'Un autre événement créé par API',
        });
      });

      it('image is uploaded to cdn when provided by file given as multipart', async () => {
        const url = oneLanguageResponse.event.image.base
          + oneLanguageResponse.event.image.filename;

        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) {
          throw new Error(`HEAD ${url} → ${res.status}`);
        }

        const lastModified = res.headers.get('last-modified');
        const sinceLastModified = Date.now() - new Date(lastModified).getTime();

        expect(sinceLastModified).toBeLessThan(20_000);
      });

      it('Event is created in french if lang is set to french in header', async () => {
        const frenchResponse = await ky
          .post('http://localhost:4000/agendas/17026855/events', {
            headers: {
              'access-token': accessToken,
              lang: 'fr',
            },
            json: _.omit(data, ['image']),
          })
          .json();

        expect(frenchResponse.event.title).toEqual({
          fr: 'Un autre événement créé par API',
        });
      });
    });

    describe('unsuccessful create (invalid data)', () => {
      let errorResponse;

      beforeAll(async () => {
        await ky
          .post('http://localhost:4000/agendas/17026855/events', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              title: {
                fr: 'Un événement créé par API',
              },
              timings: [],
              location: {
                uid: 123,
              },
              'categories-agenda-metropolitain': 42,
              'thematiques-bordeaux-metropole': [3, 4],
            },
          })
          .json()
          .catch((e) => {
            errorResponse = e.response;
          });
      });

      it('response is 400', () => {
        expect(errorResponse.status).toBe(400);
      });

      it('list of validation errors is provided in body', async () => {
        const errorData = await errorResponse.json();
        expect(errorData.errors).toEqual([
          {
            lang: 'fr',
            field: 'description',
            code: 'required',
            message: 'a string is required',
            origin: '',
            step: 'validation',
          },
          {
            code: 'timings.min.1',
            message: 'at least one timing is required',
            field: 'timings',
            origin: [],
            step: 'validation',
          },
        ]);
      });
    });

    describe('conditional required field', () => {
      test('when ref is not specified, enableWith required field is not processed', async () => {
        const responseData = await ky
          .post('http://localhost:4000/agendas/89904399/events', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              ...basicEventData,
              image: undefined,
            },
          })
          .json();
        const { event } = responseData;

        expect(event.uid).toBeDefined();
      });

      test('when ref field is specified, enableWith required field triggers validation error when not set', async () => {
        const errorResponse = await ky
          .post('http://localhost:4000/agendas/89904399/events', {
            headers: {
              'access-token': accessToken,
            },
            json: {
              ...basicEventData,
              image: {
                url: 'https://cdn.openagenda.com/main/eed1137a9bd146f0ae7f28668e5a1052.full.image.jpg',
              },
            },
          })
          .json()
          .then(
            () => {},
            (err) => err.response,
          );

        const errorData = await errorResponse.json();
        expect(errorData.message).toBe('data is invalid');
      });
    });
  });
});
