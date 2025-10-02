import { promisify } from 'node:util';
import knex from 'knex';
import _ from 'lodash';
import mysql from 'mysql2';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('network - functional ( server ): get', () => {
  let k;
  let svc;

  beforeAll(async () => {
    const con = mysql.createConnection(
      _.extend(_.pick(config.mysql, ['user', 'password']), {
        multipleStatements: true,
        ssl: { rejectUnauthorized: false },
      }),
    );

    const query = promisify(con.query.bind(con));

    await query(fixtures);

    con.end();
  });

  beforeAll(() => {
    k = knex({
      client: 'mysql2',
      connection: _.assign(
        {
          database: 'networktest',
        },
        config.mysql,
      ),
    });

    svc = Service({ knex: k });
  });

  afterAll(() => {
    k.destroy();
  });

  it('get gets', async () => {
    expect(await svc.get(1)).toEqual({
      uid: 1,
      formSchemaId: 2,
      title: 'Métropole de Toulouse',
    });
  });
});
