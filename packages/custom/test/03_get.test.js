'use strict';

process.env.NODE_ENV = 'test';

const ih = require('immutability-helper');

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');
const config = require('../testconfig');

const svc = require('./service');

schema.register({
  integer,
  text,
});

describe('extended events - functional (server): get', () => {
  beforeEach(async () => {
    await svc.initAndLoad(
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
