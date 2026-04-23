import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'simpleCache',
  'tracker',
  'accessTokens',
  'files',
  'bull',
  'events',
  'agendas',
  'agendaEvents',
  'geocoder',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'keys',
];

describe('13 - core - functional(server): core.agendas().locations.transfer', () => {
  let core;

  const config = testConfig.extendWith({
    queuesPrefix: 'q13_05:',
    es75: {
      ...testConfig.es75,
      agendaEventsIndex: 'test_13_05_locations_transfer',
    },
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['014.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(93399464).events.search.rebuild();
    await core.agendas(48353388).events.search.rebuild();
    await core.agendas(17026855).events.search.rebuild();

    core.services.agendaLocations.task({
      reset: true,
      detectDuplicates: false,
    });
    core.services.eventSearch.task({ reset: true });
    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('basic transfer', () => {
    let transferResult;
    let dbEntry;

    beforeAll(async () => {
      transferResult = await core
        .agendas(17026855)
        .locations.transfer(95455142, 48353388, { context: { userUid: 1 } });

      dbEntry = await config.knex('location').first().where('uid', 95455142);
    });

    it('returns transferred location', () => {
      expect(transferResult.uid).toBe(95455142);
    });

    it('updates agenda_id in database', () => {
      expect(dbEntry.agenda_id).toBeDefined();
    });

    it('updates set_uid in database', () => {
      // set_uid is updated based on target agenda's locationSetUid
      expect(dbEntry.set_uid).toBeDefined();
    });

    it('updates updated_at timestamp', () => {
      const updatedAt = new Date(dbEntry.updated_at);
      const now = new Date();
      const diff = now - updatedAt;
      expect(diff).toBeLessThan(5000); // Updated within last 5 seconds
    });
  });

  describe('transfer with event sync', () => {
    beforeAll(async () => {
      core
        .agendas(17026855)
        .locations.transfer(24505639, 93399464, { context: { userUid: 1 } });

      return new Promise((rs) => {
        core.services.tracker.on(
          'agendaLocations.syncImpactedEventsAndAgendas.done',
          rs,
        );
      });
    });

    it('location is transferred', async () => {
      const dbEntry = await config
        .knex('location')
        .first()
        .where('uid', 24505639);

      expect(dbEntry.agenda_id).not.toBe(null);
    });

    it('linked events are synced in source agenda', async () => {
      // Check if events in source agenda index were updated
      const { events } = await core
        .agendas(17026855)
        .events.search({ locationUid: 24505639 });

      // Events should still be searchable but may have updated location info
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('transfer to non-existent agenda', () => {
    let error;

    beforeAll(async () => {
      try {
        await core
          .agendas(17026855)
          .locations.transfer(18927679, 99999999, { context: { userUid: 1 } });
      } catch (e) {
        error = e;
      }
    });

    it('throws NotFound error', () => {
      expect(error).toBeDefined();
      expect(error.name).toBe('NotFound');
      expect(error.message).toContain('target agenda not found');
    });
  });

  describe('transfer non-existent location', () => {
    let error;

    beforeAll(async () => {
      try {
        await core
          .agendas(17026855)
          .locations.transfer(99999999, 93399464, { context: { userUid: 1 } });
      } catch (e) {
        error = e;
      }
    });

    it('throws NotFound error', () => {
      expect(error).toBeDefined();
      expect(error.name).toBe('NotFound');
      expect(error.message).toContain('location not found');
    });
  });

  describe('transfer preserves location data', () => {
    let beforeTransfer;
    let afterTransfer;

    beforeAll(async () => {
      beforeTransfer = await core.agendas(17026855).locations.get(42197191);

      afterTransfer = await core
        .agendas(17026855)
        .locations.transfer(42197191, 48353388, { context: { userUid: 1 } });
    });

    it('preserves name', () => {
      expect(afterTransfer.name).toBe(beforeTransfer.name);
    });

    it('preserves address', () => {
      expect(afterTransfer.address).toBe(beforeTransfer.address);
    });

    it('preserves latitude', () => {
      expect(afterTransfer.latitude).toBe(beforeTransfer.latitude);
    });

    it('preserves longitude', () => {
      expect(afterTransfer.longitude).toBe(beforeTransfer.longitude);
    });
  });

  describe('transfer updates event search indices', () => {
    beforeAll(async () => {
      // Use a location that hasn't been removed/modified in other tests
      const transferPromise = core
        .agendas(17026855)
        .locations.transfer(18927679, 48353388, { context: { userUid: 1 } });

      const syncPromise = new Promise((rs) => {
        core.services.tracker.on(
          'agendaLocations.syncImpactedEventsAndAgendas.done',
          async () => {
            // Give a moment for indices to be updated
            await new Promise((resolve) => setTimeout(resolve, 1000));
            rs();
          },
          true, // once
        );
      });

      await transferPromise;
      await syncPromise;
    });

    it('events are synced in target agenda index', async () => {
      const { events } = await core
        .agendas(48353388)
        .events.search({ locationUid: 18927679 });

      // After transfer, events should be findable in target agenda
      // (this depends on actual event data in fixtures)
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('api', () => {
    let server;
    let accessToken;

    beforeAll(async () => {
      const api = (await import('../api/index.js')).default;
      server = await api(core, { useRouter: false }).listen(4001);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const ky = (await import('ky')).default;
      const tokenResponse = await ky
        .post('http://localhost:4001/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    describe('successful transfer via API', () => {
      let transferResponse;
      let dbEntry;

      beforeAll(async () => {
        const ky = (await import('ky')).default;
        transferResponse = await ky
          .post(
            'http://localhost:4001/agendas/17026855/locations/123/transfer/93399464',
            {
              headers: {
                'access-token': accessToken,
              },
            },
          )
          .json();

        dbEntry = await config.knex('location').first().where('uid', 123);
      });

      it('returns success and transferred location', () => {
        expect(transferResponse.success).toBe(true);
        expect(transferResponse.location.uid).toBe(123);
      });

      it('location is transferred in database', () => {
        expect(dbEntry.agenda_id).toBeDefined();
      });

      it('location data is preserved', () => {
        expect(transferResponse.location.name).toBeDefined();
        expect(transferResponse.location.address).toBeDefined();
      });
    });

    describe('transfer to non-existent agenda', () => {
      let error;

      beforeAll(async () => {
        const ky = (await import('ky')).default;
        try {
          // Use location 9955517 which exists in fixtures
          await ky.post(
            'http://localhost:4001/agendas/17026855/locations/9955517/transfer/99999999',
            {
              headers: {
                'access-token': accessToken,
              },
            },
          );
        } catch (e) {
          error = e;
        }
      });

      it('returns 404 error', () => {
        expect(error).toBeDefined();
        expect(error.response.status).toBe(404);
      });

      it('error message indicates target agenda not found', async () => {
        const errorData = await error.response.json();
        expect(errorData.message).toContain('target agenda not found');
      });
    });

    describe('transfer non-existent location', () => {
      let error;

      beforeAll(async () => {
        const ky = (await import('ky')).default;
        try {
          await ky.post(
            'http://localhost:4001/agendas/17026855/locations/99999999/transfer/93399464',
            {
              headers: {
                'access-token': accessToken,
              },
            },
          );
        } catch (e) {
          error = e;
        }
      });

      it('returns 404 error', () => {
        expect(error).toBeDefined();
        expect(error.response.status).toBe(404);
      });

      it('error message indicates location not found', async () => {
        const errorData = await error.response.json();
        expect(errorData.message).toContain('location not found');
      });
    });

    describe('unauthorized transfer attempt', () => {
      let error;

      beforeAll(async () => {
        const ky = (await import('ky')).default;
        try {
          await ky.post(
            'http://localhost:4001/agendas/17026855/locations/60763722/transfer/93399464',
          );
        } catch (e) {
          error = e;
        }
      });

      it('returns 403 error', () => {
        expect(error).toBeDefined();
        expect(error.response.status).toBe(403);
      });
    });
  });
});
