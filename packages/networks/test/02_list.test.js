'use strict';

const { promisify } = require('node:util');
const _ = require('lodash');
const knex = require('knex');
const mysql = require('mysql');

const Service = require('..');
const config = require('../testconfig');
const fixtures = require('./fixtures');

describe('networks - functional ( server ): list', () => {
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

  it('list lists', async () => {
    expect(
      (await svc.list()).map((n) =>
        _.pick(n, ['uid', 'formSchemaId', 'title'])),
    ).toEqual([
      {
        uid: 1,
        formSchemaId: 2,
        title: 'Métropole de Toulouse',
      },
      {
        uid: 13,
        formSchemaId: 12,
        title: 'Métropole de Lille',
      },
      {
        uid: 3,
        formSchemaId: 21,
        title: 'Orléans Métropole',
      },
    ]);
  });
});
