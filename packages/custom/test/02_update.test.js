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

describe('extended events - functional (server): update', () => {
  describe('basics', () => {
    let result;

    beforeAll(async () => {
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

    beforeAll(async () => {
      await svc(3819893).create(123, {
        edition: 12,
        contender: 'steve',
      });

      result = await svc(3819893).update(123, {
        edition: 13,
        contender: 'bob',
      });
    });

    it('success key is true if update is successful', () => {
      expect(result.success).toBe(true);
    });

    it('record in db is updated', () => {
      const con = mysql.createConnection(config.mysql);

      return new Promise((resolve, reject) => {
        con.query(
          `select *
           from ${config.schemas.custom}
           where form_schema_id = ?
             and identifier = ?`,
          [3819893, 123],
          (err, rows) => {
            if (err) return reject(err);
            expect(rows.length).toBe(1);
            expect(JSON.parse(rows[0].store).contender).toBe('bob');
            resolve();
          },
        );
      }).finally(() => con.end());
    });

    it('before key contains values before update', () => {
      expect(result.before).toEqual({
        edition: 12,
        contender: 'steve',
      });
    });
  });

  describe('partial', () => {
    beforeAll(async () => {
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
