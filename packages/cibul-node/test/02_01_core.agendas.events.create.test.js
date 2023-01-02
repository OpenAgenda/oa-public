'use strict';

const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const FormData = require('form-data');
const ih = require('immutability-helper');
const request = require('superagent');

const api = require('../api');
const Core = require('../core');
const Services = require('../services/init');
const eventsFixtures = require('./fixtures/events');
const loadFixtures = require('./fixtures/load');
const testConfig = require('./testConfig');

describe('02 - core - functional (server): core.agendas().events.create()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '002.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
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
        'legacy',
        'users',
        'keys',
        'accessTokens',
        'tracker',
        'images',
        'files',
        'imageFiles',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(async () => {
    try {
      await core.services.eventSearch.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) { /* */ }
  });

  afterAll(() => core.services.simpleCache.clearAll());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('simple create', () => {
    let event;

    const memberUserUid = 63170203;

    beforeAll(async () => {
      event = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement',
        },
        description: {
          fr: 'Test de la lib core',
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        }],
        keywords: {
          fr: ['un', 'deux', 'trois'],
        },
        location: {
          uid: 123,
        },
        accessibility: { ii: true },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole': [3, 4],
        custom_description: 'Oui bah non',
      }, {
        context: {
          userUid: memberUserUid,
        },
        access: 'contributor',
      });
    });

    describe('response', () => {
      it('created event is provided in response', () => {
        expect(event.slug).toBe('un-evenement');
      });

      it('created event internal fields are not provided (id)', () => {
        expect(event.id).toBeUndefined();
      });

      it('created event does not include field with "moderator" read access', () => {
        expect(event.custom_description).toBeUndefined();
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

      it('event is created on legacy event data structure', async () => {
        const entry = await core.services.knex('event')
          .first(['uid'])
          .where('uid', event.uid);

        expect(entry.uid).toEqual(event.uid);
      });

      it('event is not marked as private', async () => async () => {
        const entry = await core.services.knex('event_2')
          .first(['private'])
          .where('uid', event.uid);

        expect(!!entry.private).toBe(false);
      });

      it('accessibility is saved in event and legacy event', async () => {
        const entry = await core.services.knex('event').first().where('uid', event.uid);
        const legacyAccessibility = entry.accessibility;

        expect(event.accessibility).toEqual({
          mi: false,
          hi: false,
          pi: false,
          vi: false,
          ii: true,
        });

        expect(legacyAccessibility).toEqual('["ii"]');
      });

      it('legacy entries were created for custom fields', async () => {
        const legacyEvent = await core.services
          .knex('event')
          .first('*')
          .where('uid', event.uid);

        const reviewArticle = await core.services
          .knex('review_article')
          .first('id')
          .where('event_id', legacyEvent.id)
          .where('review_id', 218);

        const reviewTagArticles = await core.services
          .knex('review_tag_article')
          .select('*')
          .where('review_article_id', reviewArticle.id);

        expect(reviewTagArticles.map(rta => rta.review_tag_id)).toEqual([
          9661, // Administration (2.3)
          9662, // Aéronautique (2.4)
        ]);
      });
    });

    describe('search', () => {
      let result;

      beforeAll(async () => {
        try {
          result = await core.agendas(17026855).events.search({
            uid: event.uid,
          }, {}, {
            detailed: true,
            access: 'administrator',
          });
        } catch (e) {
          // console.log(e);
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

  describe('simple create with returnPayload: true', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement',
        },
        description: {
          fr: 'Test de la lib core',
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        }],
        location: {
          uid: 123,
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole': [3, 4],
      }, {
        context: {
          userUid: 63170200,
        },
        returnPayload: true,
        access: 'contributor',
      });
    });

    it('agenda formSchema is provided in result', () => {
      expect(Object.keys(result.formSchema)).toEqual(['custom', 'fields']);
    });

    it('fields with moderator as access are not provided in schema', () => {
      expect(result.formSchema
        .fields
        .filter(f => f.field === 'custom_description').length).toBe(0);
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
      expect(result.member.userUid).toBe(63170200);
    });

    it('agenda is part payload', () => {
      expect(result.agenda.uid).toBe(17026855);
    });
  });

  describe('states', () => {
    const now = new Date();
    const inAnHour = new Date();
    inAnHour.setHours(inAnHour.getHours() + 1);

    it('create on agenda with published default state creates published event', async () => {
      const event = await core.agendas(17026855).events.create({
        title: {
          fr: 'Titre',
        },
        description: {
          fr: 'Desc',
        },
        timings: [{
          begin: now,
          end: inAnHour,
        }],
        location: {
          uid: 123,
        },
        'categories-agenda-metropolitain': 42,
      }, {
        context: { userUid: 63170200 },
        access: 'contributor',
      });

      expect(event.state).toBe(2);
    });

    it('create on agenda with to moderate default state creates to moderate event', async () => {
      const event = await core.agendas(55268170).events.create({
        title: { fr: 'T' },
        description: { fr: 'D' },
        timings: [{ begin: now, end: inAnHour }],
        location: { uid: 123 },
      }, {
        access: 'contributor',
      });

      expect(event.state).toBe(0);
    });

    it('create with contributor access can not force state', async () => {
      let error;
      try {
        await core.agendas(55268170).events.create({
          title: { fr: 'T' },
          description: { fr: 'D' },
          timings: [{ begin: now, end: inAnHour }],
          location: { uid: 123 },
          state: 2,
        }, {
          access: 'contributor',
        });
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe('not authorized to publish events');
    });

    it('create with "administrator" access can explicit state', async () => {
      const event = await core.agendas(55268170).events.create({
        title: { fr: 'T' },
        description: { fr: 'D' },
        timings: [{ begin: now, end: inAnHour }],
        location: { uid: 123 },
        state: 2,
      }, {
        access: 'administrator',
      });

      expect(event.state).toBe(2);
    });
  });

  describe('status', () => {
    it('create on agenda with published default state creates published event', async () => {
      const event = await core.agendas(17026855).events.create({
        title: {
          fr: 'Titre',
        },
        description: {
          fr: 'Desc',
        },
        status: 3,
        timings: [{
          begin: new Date('2021-05-28T12:00:00+0100'),
          end: new Date('2021-05-28T14:00:00+0100'),
        }],
        location: {
          uid: 123,
        },
        'categories-agenda-metropolitain': 42,
      }, {
        context: { userUid: 63170200 },
        access: 'contributor',
      });

      expect(event.status).toBe(3);
    });
  });

  describe('simple create with returnPayload: true and access: "moderator"', () => {
    let result;

    beforeAll(async () => {
      result = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement',
        },
        description: {
          fr: 'Test de la lib core',
        },
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        }],
        'categories-agenda-metropolitain': 42,
        location: {
          uid: 123,
        },
      }, {
        context: {
          userUid: 63170200,
        },
        returnPayload: true,
        access: 'moderator',
      });
    });

    it('field with "moderator" in read parameter are provided in result', () => {
      expect(result.formSchema
        .fields
        .filter(f => f.field === 'custom_description').length).toBe(1);
    });
  });

  describe('create in private agenda', () => {
    let event;

    const agendaUid = 81989389;
    const memberUserUid = 37892739;

    beforeAll(async () => {
      event = await core.agendas(agendaUid).events.create({
        title: {
          fr: 'Un événement privé',
        },
        description: { fr: 'D' },
        timings: [{
          begin: new Date('2021-05-28T12:00:00+0100'),
          end: new Date('2021-05-28T14:00:00+0100'),
        }],
        location: { uid: 123 },
      }, {
        userUid: memberUserUid,
      });
    });

    it('event is marked as private', () => {
      expect(event.private).toBe(true);
    });
  });

  describe('online event create', () => {
    let event;

    const memberUserUid = 63170200;
    const agendaUid = 17026855;

    beforeAll(async () => {
      event = await core.agendas(agendaUid).events.create({
        title: {
          fr: 'Un événement en ligne',
        },
        attendanceMode: 2,
        onlineAccessLink: 'https://openagenda.com',
        description: { fr: 'Voilà' },
        timings: [{
          begin: new Date('2021-05-28T12:00:00+0100'),
          end: new Date('2021-05-28T14:00:00+0100'),
        }],
        'categories-agenda-metropolitain': 42,
      }, {
        context: {
          userUid: memberUserUid,
        },
        detailed: 1,
        access: 'moderator',
      });
    });

    it('online event was created and is online', () => {
      expect(event.attendanceMode).toBe(2);
    });
  });

  describe('draft create', () => {
    let event;

    const memberUserUid = 63170200;
    const agendaUid = 17026855;

    beforeAll(async () => {
      event = await core.agendas(agendaUid).events.create({
        title: {
          fr: 'Un événement brouillon',
        },
        custom_description: ':\')',
      }, {
        context: {
          userUid: memberUserUid,
        },
        access: 'moderator',
        draft: true,
      });
    });

    it('incomplete event can be saved', () => {
      expect(event.draft).toBe(true);
    });

    it('draft event is not referenced in agenda', async () => {
      const ae = await core.services.agendaEvents(agendaUid).get(event.uid);

      expect(ae).toBeNull();
    });

    it('incomplete event with default location data and undefined location can be saved', async () => {
      const incompleteEvent = await core.agendas(agendaUid).events.create({
        title: {
          fr: 'Un autre événement brouillon',
        },
        location: {
          countryCode: 'CH',
        },
      }, {
        context: {
          userUid: memberUserUid,
        },
        draft: true,
      });

      expect(incompleteEvent.title.fr).toEqual('Un autre événement brouillon');
    });

    it('no legacy event is created for draft', async () => {
      const legacyEvent = await core.services.knex('event').first().where('uid', event.uid);
      expect(legacyEvent).toBeUndefined();
    });

    it('custom data is stored even if incomplete', async () => {
      const data = await core.services.custom(2).get(event.uid);

      expect(data).toEqual({
        custom_description: ":')",
      });
    });

    it('draft event without title can be created', async () => {
      const noTitleDraft = await core.agendas(agendaUid).events.create({
        description: {
          fr: 'Un brouillon sans titre',
        },
      }, {
        context: {
          userUid: memberUserUid,
        },
        draft: true,
      });

      expect(noTitleDraft.title).toBeUndefined();
    });
  });

  describe('data format variations', () => {
    let event;

    beforeAll(async () => {
      event = await core.agendas(17026855).events.create({
        title: {
          fr: 'Un événement',
        },
        description: {
          fr: 'Autre format d\'horaires',
        },
        image: {
          url: 'https://openagenda.com/images/openagenda.png',
        },
        timings: [{
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
        }],
        'categories-agenda-metropolitain': 42,
        location: {
          uid: 123,
        },
      }, {
        context: {
          userUid: 63170200,
        },
        access: 'contributor',
      });
    });

    it('event is created with timings provided in non Date format', () => {
      expect(event.title.fr).toBe('Un événement');
    });

    it('timings is saved in Date format', () => {
      expect(event.timings[0].begin).toBe('2019-12-06T11:23:00.000+01:00');
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
      timings: [{
        begin: new Date('2019-05-06T10:00:00'),
        end: new Date('2019-05-06T11:00:00'),
      }],
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
        await core.agendas(17026855).events.create(ih(validData, {
          $unset: ['title'],
        }), options);
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
        await core.agendas(17026855).events.create(ih(validData, {
          location: {
            $set: { uid: 124 },
          },
        }), options);
      } catch (e) {
        error = e;
      }

      expect(error.info.errors).toEqual([{
        field: 'location',
        code: 'invalid',
        message: 'provided location uid is invalid',
        origin: undefined,
        step: 'validation',
      }]);
    });

    it('create without specified location returns validation error', async () => {
      let error;
      try {
        await core.agendas(17026855).events.create(ih(validData, {
          $unset: ['location'],
        }), options);
      } catch (e) {
        error = e;
      }
      expect(error.info.errors).toEqual([{
        code: 'location.required',
        message: 'a integer is required',
        origin: undefined,
        field: 'location',
        step: 'validation',
      }]);
    });

    it('create with locationUid specified as null string', async () => {
      let error;
      try {
        await core.agendas(17026855).events.create({
          title: 'Reconnexion à Chêne-Bourg',
          description: 'Reconnexion à Chêne-Bourg',
          keywords: '',
          longDescription: 'La BioSphère s\'implante à Chêne-Bourg\n\nPorté par une vision artistique et sensorielle, un dôme géodésique inédit (BioSphère) ouvre notre horizon.\nUne installation proposée par le Muséum et le Canton de Genève, en partenariat avec la Maison du Salève, ProNatura Genève, SIG et la commune de Chêne-Bourg.\n\nProgramme détaillé: www.reconnexions-mhng.ch\n\nAvec notamment les soirées culturelles\nInfos pratiques:\n19h - 22h30\nEsplanade de la Gare Léman Express\nTout public\nGratuit, inscriptions OBLIGATOIRES sur le site: www.reconnexions-mhng.ch\n\nDates des soirées culturelles:\n- Vendredi 2 octobre\n- Jeudi 8 octobre\n- Jeudi 15 octobre\n- Jeudi 22 octobre\n- Mercredi 28 octobre\n- Jeudi 29 octobre\n- Jeudi 5 novembre\n- Jeudi 12 novembre\n[Plus d\'information sur le site de l\'organisateur](http://institutions.ville-geneve.ch/index.php?id=9515)',
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
        }, options);
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('BadRequest');
    });
  });

  describe('api', () => {
    let server;
    let accessToken;
    let response;

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      }).then(r => r.data.access_token);
    });

    describe('successful create', () => {
      beforeAll(async () => {
        try {
          response = await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/events',
            headers: {
              'access-token': accessToken,
              nonce: 123,
              'content-type': 'application/json',
            },
            data: {
              title: {
                fr: 'Un événement créé par API',
              },
              description: {
                fr: 'Un tout petit événement',
              },
              image: {
                url: 'https://cibul.s3.amazonaws.com/event_a-l-abordage-la-nouvelle-exposition-du-conservatoire-du-jeu-de-societe-au-centre-national-du-jeu_734952.jpg',
                credits: 'Les crédits',
              },
              timings: [{
                begin: new Date('2019-05-06T10:00:00'),
                end: new Date('2019-05-06T11:00:00'),
              }],
              keywords: {
                fr: ['un', 'deux', 'trois'],
              },
              location: {
                uid: 123,
              },
              'categories-agenda-metropolitain': 42,
              'thematiques-bordeaux-metropole': [3, 4],
              accessibility: { sl: true },
            },
          }).then(r => r.data);
        } catch (e) {
          // console.log(e.response.data);
        }
      });

      it('image is uploaded to cdn when provided by url', async () => {
        const uploadedHead = await request.head(response.event.image.base + response.event.image.filename).then(res => res.header);
        const sinceLastModified = new Date().getTime() - new Date(uploadedHead['last-modified']).getTime();
        expect(sinceLastModified).toBeLessThan(10000);
      });

      it('response gives success key at true if creation was a success', () => {
        expect(response.success).toBe(true);
      });

      it('response provides created event in event key', () => {
        expect(response.event.slug).toBe('un-evenement-cree-par-api');
      });

      it('backwards compatibility: credits placed in image.credits are moved to imageCredits', () => {
        expect(response.event.imageCredits).toBe('Les crédits');
      });

      it('create with superagent', async () => {
        const createResponse = await request.post('http://localhost:3000/agendas/17026855/events')
          .type('form')
          .accept('json')
          .query({ key: null })
          .set('access-token', accessToken)
          .set('nonce', _.random(10 ** 6))
          .field({
            data: JSON.stringify(_.omit(eventsFixtures[3], ['state'])),
          });

        expect(createResponse.body.success).toBe(true);
      });

      it('create online event', async () => {
        const onlineEventCreateResponse = await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 39209390,
            'content-type': 'application/json',
          },
          data: {
            title: {
              fr: 'Un événement créé par API',
            },
            description: {
              fr: 'Un tout petit événement',
            },
            image: {
              url: 'https://cibul.s3.amazonaws.com/event_a-l-abordage-la-nouvelle-exposition-du-conservatoire-du-jeu-de-societe-au-centre-national-du-jeu_734952.jpg',
              credits: 'Les crédits',
            },
            timings: [{
              begin: new Date('2019-05-06T10:00:00'),
              end: new Date('2019-05-06T11:00:00'),
            }],
            keywords: {
              fr: ['un', 'deux', 'trois'],
            },
            attendanceMode: 2,
            onlineAccessLink: 'https://openagenda.com',
            'categories-agenda-metropolitain': 42,
            'thematiques-bordeaux-metropole': [3, 4],
            accessibility: { sl: true },
          },
        }).then(r => r.data);

        expect(onlineEventCreateResponse.event.attendanceMode).toBe(2);
      });

      it('create event with invalid url provided in image', async () => {
        let error;
        try {
          await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/events',
            headers: {
              'access-token': accessToken,
              nonce: 794546,
              'content-type': 'application/json',
            },
            data: {
              title: {
                fr: 'Un événement créé par API',
              },
              description: {
                fr: 'Un tout petit événement',
              },
              image: {
                url: 'https://cibul.s3.amazonaws.com/event_a-l-abo',
                credits: 'Les crédits',
              },
              timings: [{
                begin: new Date('2019-05-06T10:00:00'),
                end: new Date('2019-05-06T11:00:00'),
              }],
              attendanceMode: 2,
              onlineAccessLink: 'https://openagenda.com',
              'categories-agenda-metropolitain': 42,
              'thematiques-bordeaux-metropole': [3, 4],
            },
          }).then(r => r.data);
        } catch (e) {
          error = e;
        }

        expect(error.response.status).toBe(400);
        expect(error.response.data.errors).toEqual([{
          field: 'image',
          code: 'url.invalid',
          message: 'provided image url is not valid',
        }]);
      });

      it('contributor may not set state through api', async () => {
        let error;
        try {
          await request.post('http://localhost:3000/agendas/17026855/events')
            .type('form')
            .accept('json')
            .query({ key: null })
            .set('access-token', accessToken)
            .set('nonce', _.random(10 ** 6))
            .field({
              data: JSON.stringify(eventsFixtures[3]),
            });
        } catch (e) {
          error = e;
        }

        expect(error.response.statusCode).toBe(403);
        expect(error.response.body.message).toBe('not authorized to publish events');
      });
    });

    describe('create with one language in input and with a file attached', () => {
      let oneLanguageResponse;

      const data = {
        title: 'Un autre événement créé par API',
        description: 'Un tout petit événement',
        timings: [{
          begin: new Date('2019-05-06T10:00:00'),
          end: new Date('2019-05-06T11:00:00'),
        }],
        keywords: ['un', 'deux', 'trois'],
        location: {
          uid: 123,
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole': [3, 4],
        accessibility: { sl: true },
      };

      beforeAll(() => new Promise(rs => {
        fs.createReadStream(`${__dirname}/fixtures/pirates.jpg`)
          .pipe(fs.createWriteStream('/tmp/pirates.jpg'))
          .on('close', rs);
      }));

      beforeAll(async () => {
        try {
          const form = new FormData();

          form.append('image', fs.createReadStream('/tmp/pirates.jpg'));
          form.append('access_token', accessToken);
          form.append('nonce', 123456);
          form.append('data', JSON.stringify(data));

          oneLanguageResponse = await axios({
            method: 'post',
            url: 'http://localhost:3000/agendas/17026855/events',
            data: form,
            headers: form.getHeaders(),
          }).then(r => r.data);
        } catch (e) {
          /* console.log(JSON.stringify(e.      let oneLanguageResponse
            .data, null, 2)); */
        }
      });

      it('Event is created in english if lang is not specified', async () => {
        expect(oneLanguageResponse.event.title).toEqual({
          en: 'Un autre événement créé par API',
        });
      });

      it('image is uploaded to cdn when provided by file given as multipart', async () => {
        const uploadedHead = await request.head(oneLanguageResponse.event.image.base + oneLanguageResponse.event.image.filename).then(res => res.header);
        const sinceLastModified = new Date().getTime() - new Date(uploadedHead['last-modified']).getTime();
        expect(sinceLastModified).toBeLessThan(20000);
      });

      it('Event is created in french if lang is set to french in header', async () => {
        const frenchResponse = await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 1234567,
            'content-type': 'application/json',
            lang: 'fr',
          },
          data: _.omit(data, ['image']),
        }).then(r => r.data);

        expect(frenchResponse.event.title).toEqual({
          fr: 'Un autre événement créé par API',
        });
      });
    });

    describe('unsuccessful create (invalid data)', () => {
      let errorResponse;

      beforeAll(async () => {
        await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/17026855/events',
          headers: {
            'access-token': accessToken,
            nonce: 1234,
            'content-type': 'application/json',
          },
          data: {
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
        }).catch(e => {
          errorResponse = e.response;
        });
      });

      it('response is 400', () => {
        expect(errorResponse.status).toBe(400);
      });

      it('list of validation errors is provided in body', () => {
        expect(errorResponse.data.errors).toEqual([{
          lang: 'fr',
          field: 'description',
          code: 'required',
          message: 'a string is required',
          origin: '',
          step: 'validation',
        }, {
          code: 'timings.min.1',
          message: 'at least one timing is required',
          field: 'timings',
          origin: [],
          step: 'validation',
        }]);
      });
    });
  });
});
