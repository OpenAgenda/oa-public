import * as url from 'node:url';
import fs from 'node:fs';
import { promisify } from 'node:util';
import _ from 'lodash';
import mysql from 'mysql2';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default async (config, sql) => {
  const getCon = (omitDB = false) =>
    mysql.createConnection({
      ..._.omit(config, omitDB ? ['database'] : []),
      multipleStatements: true,
    });

  const con = getCon(true);

  const compiledSQL = `${sql.map((fx) => fs.readFileSync(`${__dirname}/${fx}`, 'utf-8').replace(/;(\n|)$/, '')).join(';\n')};`;

  await promisify(con.query.bind(con))(compiledSQL);

  con.end();

  const query = async (qSQL, values) => {
    const qCon = getCon();
    await promisify(qCon.query.bind(con))(qSQL, values);
    con.end();
  };

  return {
    query,
  };
};
