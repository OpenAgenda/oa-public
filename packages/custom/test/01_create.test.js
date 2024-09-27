'use strict';

const ih = require('immutability-helper');
const mysql = require('mysql');
const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');
const config = require('../testconfig');
const svc = require('./service');

schema.register({
  integer,
  text,
});

describe('extended events - functional (server): create', () => {
  beforeEach(async () => {
    await svc.initAndLoad(
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
