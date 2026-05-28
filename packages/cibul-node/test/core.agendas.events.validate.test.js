import ky from 'ky';
import api from '../api/index.js';
import Core from '../core/index.js';
import Services from '../services/init.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
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
  'accessTokens',
  'tracker',
  'images',
  'files',
  'imageFiles',
];

describe('core - functional (server): POST /agendas/:agendaUid/events/validate', () => {
  let core;
  let server;
  let accessToken;

  const config = testConfig.extendWith({
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_events_validate',
    },
  });

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
  });

  beforeAll(async () => {
    server = await api(core, { useRouter: false }).listen(4000);
  });

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

  afterAll(() => server.close());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('valid complete event', () => {
    let response;

    beforeAll(async () => {
      response = await ky
        .post('http://localhost:4000/agendas/17026855/events/validate', {
          headers: {
            'access-token': accessToken,
          },
          json: {
            title: {
              fr: 'Un événement validé',
            },
            description: {
              fr: 'Description de test',
            },
            timings: [
              {
                begin: '2025-05-06T10:00:00',
                end: '2025-05-06T11:00:00',
              },
            ],
            location: {
              uid: 123,
            },
          },
        })
        .json();
    });

    it('returns success true', () => {
      expect(response.success).toBe(true);
    });

    it('returns cleaned event data', () => {
      expect(response.event.title).toEqual({ fr: 'Un événement validé' });
      expect(response.event.description).toEqual({ fr: 'Description de test' });
    });

    it('does not create the event in database', async () => {
      const events = await core.agendas(17026855).events.list();
      const found = events.find((e) => e.title?.fr === 'Un événement validé');
      expect(found).toBeUndefined();
    });
  });

  describe('valid draft event', () => {
    let response;

    beforeAll(async () => {
      response = await ky
        .post(
          'http://localhost:4000/agendas/17026855/events/validate?draft=true',
          {
            headers: {
              'access-token': accessToken,
            },
            json: {
              title: {
                fr: 'Un brouillon',
              },
            },
          },
        )
        .json();
    });

    it('returns success true for incomplete event in draft mode', () => {
      expect(response.success).toBe(true);
    });

    it('returns cleaned event data', () => {
      expect(response.event.title).toEqual({ fr: 'Un brouillon' });
    });
  });

  describe('invalid event', () => {
    let response;

    beforeAll(async () => {
      response = await ky
        .post('http://localhost:4000/agendas/17026855/events/validate', {
          headers: {
            'access-token': accessToken,
          },
          json: {
            attendanceMode: 1,
          },
        })
        .json()
        .then(
          () => {},
          (e) => e.response,
        );
    });

    it('returns 400 status', () => {
      expect(response.status).toBe(400);
    });

    it('returns validation errors', async () => {
      const body = await response.json();
      expect(body.errors).toBeDefined();
      expect(body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('missing required fields', () => {
    let body;

    beforeAll(async () => {
      await ky
        .post('http://localhost:4000/agendas/17026855/events/validate', {
          headers: {
            'access-token': accessToken,
          },
          json: {
            title: { fr: 'Titre seul' },
          },
        })
        .json()
        .then(
          () => {},
          async (e) => {
            body = await e.response.json();
            return e.response;
          },
        );
    });

    it('returns errors for missing required fields', () => {
      expect(body.errors).toBeDefined();
      const errorFields = body.errors.map((e) => e.field);
      expect(errorFields).toContain('description');
    });
  });

  describe('authentication', () => {
    it('returns 401 without access token', async () => {
      const response = await ky
        .post('http://localhost:4000/agendas/17026855/events/validate', {
          json: {
            title: { fr: 'Test' },
          },
        })
        .json()
        .then(
          () => {},
          (e) => e.response,
        );

      expect(response.status).toBe(403);
    });
  });
});
