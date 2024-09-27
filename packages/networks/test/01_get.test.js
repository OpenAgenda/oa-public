'use strict';

const { promisify } = require('node:util');
const knex = require('knex');
const _ = require('lodash');
const mysql = require('mysql');

const Service = require('..');
const config = require('../testconfig');
const fixtures = require('./fixtures');

describe('network - functional ( server ): get', () => {
  let k;
  let svc;

  beforeAll(async () => {
    const con = mysql.createConnection(
      _.extend(_.pick(config.mysql, ['user', 'password']), {
        multipleStatements: true,
        ssl: true,
      }),
    );

    const query = promisify(con.query.bind(con));

    await query(fixtures);

    con.end();
  });

  beforeAll(() => {
    k = knex({
      client: 'mysql',
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
