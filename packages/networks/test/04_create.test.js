import { promisify } from 'node:util';
import knex from 'knex';
import _ from 'lodash';
import mysql from 'mysql2';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('networks - functional ( server ): create', () => {
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
    network = await svc.create({ title: 'Reykjavik Métropole' });
  });

  afterAll(() => {
    k.destroy();
  });

  it('create returns created network object', async () => {
    expect(network.title).toBe('Reykjavik Métropole');

    expect(network.uid).toBeGreaterThan(0);
  });

  it('create commits network to db', async () => {
    const fromDb = await k('network').first('title').where('uid', network.uid);

    expect(fromDb.title).toBe('Reykjavik Métropole');
  });
});
