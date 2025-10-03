import { promisify } from 'node:util';
import fs from 'node:fs';
import _ from 'lodash';
import knex from 'knex';
import mysql from 'mysql2';

const mysqlKnex = knex({
  client: 'mysql2',
});

function _parseJSON(fx) {
  return mysqlKnex(fx.path.split('.').shift()).insert(JSON.parse(fx.content));
}

function _parseSQL(fx) {
  return fx.content.replace(/;(\n|)$/, '');
}

async function _load(config, files) {
  const getCon = (omitDB = false) =>
    mysql.createConnection({
      ..._.omit(config, omitDB ? ['database'] : []),
      multipleStatements: true,
    });

  const con = getCon(true);

  const compiledSQL = `${files
    .map((f) => ({
      path: f,
      type: f.split('.').pop(),
      content: fs.readFileSync(`${import.meta.dirname}/${f}`, 'utf-8'),
    }))
    .map((fx) => (fx.type === 'sql' ? _parseSQL : _parseJSON)(fx))
    .join(';\n')};`;

  await promisify(con.query.bind(con))(compiledSQL);

  con.end();

  const query = async (sql, values) => {
    const queryCon = getCon();
    await promisify(queryCon.query.bind(queryCon))(sql, values);
    queryCon.end();
  };

  return {
    query,
  };
}

export default (dbConfig) => {
  const client = knex({
    client: 'mysql2',
    connection: {
      ...dbConfig,
      database: 'oatest_aggregators',
    },
  });

  return {
    destroyClient: () => client.destroy(),
    client,
    load: (files) => _load(dbConfig, files),
  };
};
