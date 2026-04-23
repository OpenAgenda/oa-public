import ih from 'immutability-helper';
import schema from '@openagenda/validators/schema/index.js';
import integer from '@openagenda/validators/integer.js';
import text from '@openagenda/validators/text.js';
import config from '../testconfig.js';
import svc from '../index.js';
import setup from './fixtures/setup.js';

schema.register({
  integer,
  text,
});

describe('extended events - functional (server): get', () => {
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
  });

  afterEach(() => knex?.destroy());

  it('get custom data by form schema id and identifier', async () => {
    await svc(12).create(123, {
      edition: 12,
      contender: 'Phteve',
    });

    expect(await svc(12).get(123)).toEqual({
      edition: 12,
      contender: 'Phteve',
    });
  });
});
