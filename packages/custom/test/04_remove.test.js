'use strict';

process.env.NODE_ENV = 'test';

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

describe('extended events - functional (server): remove', () => {
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

  beforeEach(async () => {
    await svc(12).create(123, {
      edition: 12,
      contender: 'Phteve',
    });
  });

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

    const con = mysql.createConnection(config.mysql);

    return new Promise((resolve, reject) => {
      con.query(
        `select * from ${config.schemas.custom} where form_schema_id = ? and identifier = ?`,
        [12, 123],
        (err, rows) => {
          if (err) return reject(err);

          expect(rows.length).toBe(0);
          resolve();
        },
      );
    }).finally(() => con.end());
  });
});
