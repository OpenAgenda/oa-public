import fs from 'node:fs';
import { promisify } from 'node:util';
import _ from 'lodash';
import mysql from 'mysql2';

export default async (config, sql) => {
  const con = mysql.createConnection({
    ..._.omit(config, ['database']),
    multipleStatements: true,
  });

  const compiledSQL = `${sql.map((fx) => fs.readFileSync(`${import.meta.dirname}/${fx}`, 'utf-8').replace(/;(\n|)$/, '')).join(';\n')};`;

  await promisify(con.query.bind(con))(compiledSQL);

  con.end();
};
