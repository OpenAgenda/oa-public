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

describe('extended events - functional (server): create', () => {
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
              $set: (_formSchemaId, _options) =>
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

  afterEach(() => knex?.destroy());

  it('create the simplest extended event gives a success response', async () => {
    const result = await svc(3819893).create(123, {
      edition: 12,
      contender: 'steve',
    });

    expect(result.success).toBe(true);
  });

  it('create adds a record in db', async () => {
    await svc(12345).create(678, {
      edition: 14,
      contender: 'Jeff',
    });

    const rows = await knex(config.schemas.custom)
      .select('*')
      .where({ form_schema_id: 12345, identifier: 678 });

    expect(rows.length).toBe(1);
  });
});
