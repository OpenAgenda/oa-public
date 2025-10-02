import ih from 'immutability-helper';
import mysql from 'mysql2';
import schema from '@openagenda/validators/schema/index.js';
import integer from '@openagenda/validators/integer.js';
import text from '@openagenda/validators/text.js';
import config from '../testconfig.js';
import svc, { initAndLoad } from './service/index.js';

schema.register({
  integer,
  text,
});

describe('extended events - functional (server): create', () => {
  beforeEach(async () => {
    await initAndLoad(
      ih(config, {
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
      }),
    );
  });

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

    const con = mysql.createConnection(config.mysql);

    return new Promise((resolve, reject) => {
      con.query(
        `select *
         from ${config.schemas.custom}
         where form_schema_id = ?
           and identifier = ?`,
        [12345, 678],
        (err, rows) => {
          if (err) return reject(err);

          expect(rows.length).toBe(1);

          resolve();
        },
      );
    }).finally(() => con.end());
  });
});
