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

describe('extended events - functional (server): set', () => {
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

  it('set the simplest extended event gives a success response and the type of operation made', async () => {
    const result = await svc(3819893).set(123, {
      edition: 12,
      contender: 'steve',
    });

    expect(result.success).toBe(true);

    expect(result.operation).toBe('create');

    const result2 = await svc(3819893).set(123, {
      edition: 12,
      contender: 'bob',
    });

    expect(result2.success).toBe(true);

    expect(result2.operation).toBe('update');
  });
});
