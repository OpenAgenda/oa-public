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

describe('extended events - functional (server): set', () => {
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
