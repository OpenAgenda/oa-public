import ky from 'ky';
import Services from '../services/init.js';
import Core from '../core/index.js';
import api from '../api/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('12 - core - functional (server): core.networks().agendas', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '013.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
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
        'keys',
      ],
    });

    core = Core(services, testConfig);
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
        const entry = await testConfig
          .knex('review')
          .first(['network_uid'])
          .where('uid', 3);

        expect(entry.network_uid).toBe(1);
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
        const entry = await testConfig
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
    it('removes abstract placeholders from child when network field is removed', async () => {
      const networkFieldKey = 'networkInheritanceTest';
      const customFieldKey = 'customChildField';
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
      const agenda = await core.agendas(1).get({
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

      // Step 4: Verify abstract placeholder exists in child schema
      const schemaBeforeRemoval = await formSchemas.get(agenda.formSchemaId);
      const abstractField = schemaBeforeRemoval.fields.find(
        (f) => f.field === networkFieldKey && f.fieldType === 'abstract',
      );
      expect(abstractField).toBeDefined();

      // Step 5: Remove field from network schema (cascade should remove abstract placeholder)
      await core.networks(1).schema.updateFields([]);

      // Wait for cascade to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Step 6: Verify abstract placeholder was removed from child schema
      const schemaAfterRemoval = await formSchemas.get(agenda.formSchemaId);
      const abstractFieldAfter = schemaAfterRemoval.fields.find(
        (f) => f.field === networkFieldKey,
      );
      expect(abstractFieldAfter).toBeUndefined();

      // Verify custom field still exists (cascade only removes abstract placeholders)
      const customFieldAfter = schemaAfterRemoval.fields.find(
        (f) => f.field === customFieldKey,
      );
      expect(customFieldAfter).toBeDefined();
    });
  });

  describe('api', () => {
    let server;
    let accessToken;
    const superAdminSecret = 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM';
    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
      const tokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: superAdminSecret,
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    afterAll(() => server.close());

    it('agenda creation', async () => {
      const resp = await ky
        .post('http://localhost:4000/networks/1/agendas', {
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

    it('GET network eventSchema configure - returns schema with parents', async () => {
      const res = await ky
        .get(
          'http://localhost:4000/networks/1/settings/eventSchema/configure',
          {
            headers: {
              'access-token': accessToken,
            },
            searchParams: { lang: 'en' },
          },
        )
        .json();

      // Networks should have only 1 parent (base event schema)
      // Unlike agendas which can have 2 (base + network)
      expect(res.parents.length).toBe(1);
      expect(res.parents[0].schema.id).toBe(-1); // Base event schema
      expect(res.reservedFields).toBeDefined();
      // Network schema may be null if not yet configured
      expect(res.schema === null || typeof res.schema === 'object').toBe(true);
    });

    it('POST network eventSchema configure - adds custom field', async () => {
      const customField = {
        field: 'network-test-field',
        fieldType: 'text',
        label: { fr: 'Test Network Field', en: 'Test Network Field' },
      };

      const result = await ky
        .post(
          'http://localhost:4000/networks/1/settings/eventSchema/configure',
          {
            headers: {
              'access-token': accessToken,
            },
            json: {
              fields: [customField],
            },
          },
        )
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
        .post(
          'http://localhost:4000/networks/1/settings/eventSchema/configure',
          {
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
          },
        )
        .json();

      // Wait for cascade to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify child agenda (agenda 1) can see the network field
      const agenda = await core.agendas(1).get({
        access: 'internal',
        detailed: true,
      });
      expect(agenda.networkUid).toBe(1);

      const mergedSchema = await core
        .agendas(1)
        .settings.schema.getMerged({ lang: 'en' });

      const networkField = mergedSchema.fields.find(
        (f) => f.field === 'network-cascade-test',
      );
      expect(networkField).toBeDefined();
    });
  });
});
