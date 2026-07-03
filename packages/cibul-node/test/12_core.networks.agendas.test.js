import ky from 'ky';
import Services from '../services/init.js';
import Core from '../core/index.js';
import api from '../api/index.js';
import { withTestServer } from './helpers/startTestServer.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import waitFor from './helpers/waitFor.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'files',
  'bull',
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
];

describe('12 - core - functional (server): core.networks().agendas', () => {
  let core;
  const config = testConfig.extendWith({
    cachePrefix: 'c12_core_networks_agendas_test',
    queuesPrefix: 'q12:',
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['013.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, config);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core.networks.agendas.add', () => {
    describe('successful', () => {
      let result;

      beforeAll(async () => {
        result = await core.networks(1).agendas.add(3);
      });

      it('result is updated agenda', () => {
        expect(result.uid).toBe(3);
      });

      it('network reference is included in response', () => {
        expect(result.networkUid).toBe(1);
      });

      it('db entry has network reference', async () => {
        const entry = await config
          .knex('review')
          .first(['network_uid'])
          .where('uid', 3);

        expect(entry.network_uid).toBe(1);
      });
    });

    describe('with feature options (official + credentials)', () => {
      let result;
      let stored;

      beforeAll(async () => {
        // Agenda 9's fixture lacks a description; the agenda update validates
        // the whole merged agenda (description required), so seed one first.
        await config
          .knex('review')
          .update({ description: 'desc' })
          .where('uid', 9);

        result = await core.networks(1).agendas.add(9, {
          official: true,
          credentials: { docxExport: true, showTotals: true },
        });

        stored = await core.agendas(9).get({ access: 'internal' });
      });

      it('adds the agenda to the network', () => {
        expect(result.uid).toBe(9);
        expect(result.networkUid).toBe(1);
      });

      it('marks the agenda as official', () => {
        expect(stored.official).toBeTruthy();
      });

      it('sets the selected credentials', () => {
        expect(stored.credentials.docxExport).toBe(true);
        expect(stored.credentials.showTotals).toBe(true);
      });
    });

    describe('fail due to Agenda already being associated to a network', () => {
      let error;

      beforeAll(async () => {
        try {
          await core.networks(1).agendas.add(1);
        } catch (e) {
          error = e;
        }
      });

      it('error name is BadRequest', () => {
        expect(error.name).toBe('BadRequest');
      });

      it('error provides detailed message', () => {
        expect(error.message).toBe('agenda is already in the network');
      });
    });
  });

  describe('core.networks.agendas.remove', () => {
    describe('successful', () => {
      let result;

      beforeAll(async () => {
        result = await core.networks(1).agendas.remove(2);
      });

      it('result is updated agenda', () => {
        expect(result.uid).toBe(2);
      });

      it('network reference has been removed from agenda', () => {
        expect(result.networkUid).toBe(null);
      });

      it('db entry for agenda no longer holds network reference', async () => {
        const entry = await config
          .knex('review')
          .first(['network_uid'])
          .where('uid', 2);

        expect(entry.network_uid).toBe(null);
      });
    });

    describe('fail for not being part of agenda', () => {
      let error;

      beforeAll(async () => {
        try {
          await core.networks(1).agendas.remove(11);
        } catch (e) {
          error = e;
        }
      });

      it('error name is BadRequest', () => {
        expect(error.name).toBe('BadRequest');
      });

      it('error provides detailed message', () => {
        expect(error.message).toBe('agenda is not in network');
      });
    });
  });

  describe('core.networks.schema.updateFields - cascade to children', () => {
    let agenda;
    const networkFieldKey = 'networkInheritanceTest';
    const customFieldKey = 'customChildField';

    beforeAll(async () => {
      const { formSchemas } = core.services;

      // Step 1: Add a custom field to child agenda so it has its own schema
      await core.agendas(1).settings.schema.updateFields([
        {
          field: customFieldKey,
          fieldType: 'text',
          label: { fr: 'Custom Field', en: 'Custom Field' },
        },
      ]);

      // Step 2: Add a field to network schema
      await core.networks(1).schema.updateFields([
        {
          field: networkFieldKey,
          fieldType: 'text',
          label: { fr: 'Test Inheritance', en: 'Test Inheritance' },
        },
      ]);

      // Step 3: Add abstract placeholder to child schema (simulates reordering)
      agenda = await core.agendas(1).get({
        access: 'internal',
        detailed: true,
      });

      const agendaSchema = await formSchemas.get(agenda.formSchemaId);
      await formSchemas.update(agenda.formSchemaId, {
        ...agendaSchema,
        fields: [
          ...agendaSchema.fields,
          {
            field: networkFieldKey,
            fieldType: 'abstract',
            label: { fr: 'Test Inheritance', en: 'Test Inheritance' },
          },
        ],
      });
    });

    beforeAll(async () => {
      // Start the cascade worker (autorun: false until the first call) and
      // trigger the network-field removal. The removal reaches the child
      // through an async `networkSchemaUpdateChild` job — but the queue can also
      // hold unrelated jobs from earlier describes that only get processed once
      // the worker starts here, so resolving on a single job-completed event
      // races the actual removal write. The assertion below polls for the
      // settled state instead.
      core.tasks({ active() {}, error() {}, failed() {}, completed() {} });
      await core.networks(1).schema.updateFields([]);
    });

    it('removes abstract placeholders from child when network field is removed', async () => {
      const { formSchemas } = core.services;

      // Poll until the cascade has actually removed the abstract placeholder
      // from the child schema (read-after-write is async), rather than trusting
      // a job event that can fire before the removal write lands.
      const schemaAfterRemoval = await waitFor(
        async () => {
          const schema = await formSchemas.get(agenda.formSchemaId);
          const stillThere = schema.fields.some(
            (f) => f.field === networkFieldKey,
          );
          return stillThere ? null : schema;
        },
        { message: 'abstract placeholder to be removed from child schema' },
      );

      expect(
        schemaAfterRemoval.fields.find((f) => f.field === networkFieldKey),
      ).toBeUndefined();
      expect(
        schemaAfterRemoval.fields.find((f) => f.field === customFieldKey),
      ).toBeDefined();
    });
  });

  describe('api', () => {
    let accessToken;
    const superAdminSecret = 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM';

    const ctx = withTestServer(() => api(core, { useRouter: false }));

    beforeAll(async () => {
      const tokenResponse = await ky
        .post(`${ctx.baseUrl}/requestAccessToken`, {
          json: {
            code: superAdminSecret,
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    it('agenda creation', async () => {
      const resp = await ky
        .post(`${ctx.baseUrl}/networks/1/agendas`, {
          headers: {
            'access-token': accessToken,
          },
          json: {
            title: 'new agenda',
            description: 'new agenda description',
          },
        })
        .json();

      expect(resp.title).toBe('new agenda');
    });

    it('agenda creation honours the provided slug', async () => {
      const resp = await ky
        .post(`${ctx.baseUrl}/networks/1/agendas`, {
          headers: {
            'access-token': accessToken,
          },
          json: {
            title: 'Agenda with explicit slug',
            description: 'an agenda whose slug differs from its title',
            slug: 'my-explicit-slug',
          },
        })
        .json();

      expect(resp.slug).toBe('my-explicit-slug');
    });

    it('GET network eventSchema configure - returns schema with parents', async () => {
      const res = await ky
        .get(`${ctx.baseUrl}/networks/1/settings/eventSchema/configure`, {
          headers: {
            'access-token': accessToken,
          },
          searchParams: { lang: 'en' },
        })
        .json();

      expect(res.parents.length).toBe(1);
      expect(res.parents[0].schema.id).toBe(-1);
      expect(res.reservedFields).toBeDefined();
      expect(res.schema === null || typeof res.schema === 'object').toBe(true);
    });

    it('POST network eventSchema configure - adds custom field', async () => {
      const customField = {
        field: 'network-test-field',
        fieldType: 'text',
        label: { fr: 'Test Network Field', en: 'Test Network Field' },
      };

      const result = await ky
        .post(`${ctx.baseUrl}/networks/1/settings/eventSchema/configure`, {
          headers: {
            'access-token': accessToken,
          },
          json: {
            fields: [customField],
          },
        })
        .json();

      expect(result).toBeTruthy();
      expect(result.fields).toBeDefined();
      const addedField = result.fields.find(
        (f) => f.field === 'network-test-field',
      );
      expect(addedField).toBeDefined();
      expect(addedField.fieldType).toBe('text');
    });

    it('POST network eventSchema configure - updates cascade to child agendas', async () => {
      // Add a field to network
      await ky
        .post(`${ctx.baseUrl}/networks/1/settings/eventSchema/configure`, {
          headers: {
            'access-token': accessToken,
          },
          json: {
            fields: [
              {
                field: 'network-cascade-test',
                fieldType: 'text',
                label: { fr: 'Cascade Test', en: 'Cascade Test' },
              },
            ],
          },
        })
        .json();

      // Verify child agenda (agenda 1) can see the network field
      const agenda = await core.agendas(1).get({
        access: 'internal',
        detailed: true,
      });
      expect(agenda.networkUid).toBe(1);

      // The field reaches the child through an async cascade — poll the merged
      // schema until it appears instead of racing a fixed sleep.
      const networkField = await waitFor(
        async () => {
          const mergedSchema = await core
            .agendas(1)
            .settings.schema.getMerged({ lang: 'en' });
          return mergedSchema.fields.find(
            (f) => f.field === 'network-cascade-test',
          );
        },
        { message: 'network field to cascade into child merged schema' },
      );
      expect(networkField).toBeDefined();
    });
  });
});
