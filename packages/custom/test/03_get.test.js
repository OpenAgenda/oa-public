import ih from 'immutability-helper';
import schema from '@openagenda/validators/schema/index.js';
import integer from '@openagenda/validators/integer.js';
import text from '@openagenda/validators/text.js';
import config from '../testconfig.js';
import svc, { initAndLoad } from './service/index.js';

schema.register({
  integer,
  text,
});

describe('extended events - functional (server): get', () => {
  beforeEach(async () => {
    await initAndLoad(
      ih(config, {
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
      }),
    );
  });

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
