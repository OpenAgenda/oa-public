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

describe('extended events - functional (server): remove', () => {
  let knex;

  beforeEach(async () => {
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

    await svc(12).create(123, {
      edition: 12,
      contender: 'Phteve',
    });
  });

  afterEach(() => knex?.destroy());

  it('remove custom data by form schema id and identifier', async () => {
    expect(await svc(12).remove(123)).toEqual({
      success: true,
      removed: {
        contender: 'Phteve',
        edition: 12,
      },
    });
  });

  it('remove effectively removes', async () => {
    await svc(12).remove(123);

    const rows = await knex(config.schemas.custom)
      .select('*')
      .where({ form_schema_id: 12, identifier: 123 });

    expect(rows.length).toBe(0);
  });
});
