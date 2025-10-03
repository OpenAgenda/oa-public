import { promisify } from 'node:util';
import knex from 'knex';
import _ from 'lodash';
import mysql from 'mysql2';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('networks - functional ( server ): update', () => {
  let k;
  let svc;
  let network;

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

  beforeAll(async () => {
    network = await svc.update(13, {
      title: 'Ville de Genève',
      formSchemaId: 123,
    });

    await svc.patch(13, {
      formSchemaId: 456,
    });
  });

  afterAll(() => {
    k.destroy();
  });

  it('update returns updated network object', async () => {
    expect(network.title).toBe('Ville de Genève');

    expect(network.uid).toBe(13);
  });

  it('update commits network to db', async () => {
    const fromDb = await k('network').first('title').where('uid', 13);

    expect(fromDb.title).toBe('Ville de Genève');
  });

  it('patch updates specified value only', async () => {
    const fromDb = await k('network')
      .first(['title', 'form_schema_id'])
      .where('uid', 13);

    expect(fromDb.form_schema_id).toBe(456);
  });
});
