import ih from 'immutability-helper';
import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';
import text from '@openagenda/validators/text';
import config from '../testconfig.js';
import svc from '../index.js';
import setup from './fixtures/setup.js';

schema.register({
  integer,
  text,
});

describe('extended events - functional (server): update', () => {
  describe('basics', () => {
    let knex;
    let result;

    beforeAll(async () => {
      knex = await setup({
        mysql: config.mysql,
        schemas: config.schemas,
      });

      svc.init(
        ih(
          { ...config, knex },
          {
            interfaces: {
              getValidator: {
                $set: (_formSchemaId) =>
                  schema({
                    edition: {
                      type: 'integer',
                    },
                    contender: {
                      type: 'text',
                    },
                  }),
              },
            },
          },
        ),
      );

      await svc(3819893).create(123, {
        edition: 12,
        contender: 'steve',
      });

      result = await svc(3819893).update(123, {
        edition: 13,
        contender: 'bob',
      });
    });

    afterAll(() => knex?.destroy());

    it('success key is true if update is successful', () => {
      expect(result.success).toBe(true);
    });

    it('record in db is updated', async () => {
      const rows = await knex(config.schemas.custom)
        .select('*')
        .where({ form_schema_id: 3819893, identifier: 123 });

      expect(rows.length).toBe(1);
      expect(JSON.parse(rows[0].store).contender).toBe('bob');
    });

    it('before key contains values before update', () => {
      expect(result.before).toEqual({
        edition: 12,
        contender: 'steve',
      });
    });
  });

  describe('partial', () => {
    let knex;

    beforeAll(async () => {
      knex = await setup({
        mysql: config.mysql,
        schemas: config.schemas,
      });

      svc.init(
        ih(
          { ...config, knex },
          {
            interfaces: {
              getValidator: {
                $set: (_formSchemaId) =>
                  schema({
                    edition: {
                      type: 'integer',
                    },
                    contender: {
                      type: 'text',
                    },
                  }),
              },
            },
          },
        ),
      );
    });

    afterAll(() => knex?.destroy());

    it('partial update only updates provided fields', async () => {
      await svc(3819893).create(7666, {
        edition: 22,
        contender: 'Stanislas',
      });

      const result = await svc(3819893).update(
        7666,
        {
          contender: 'Boris',
        },
        { partial: true },
      );

      expect(result).toEqual({
        success: true,
        before: {
          edition: 22,
          contender: 'Stanislas',
        },
        custom: {
          edition: 22,
          contender: 'Boris',
        },
      });
    });
  });
});
