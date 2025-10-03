import { promisify } from 'node:util';
import _ from 'lodash';
import mysql from 'mysql2';

export default async (config, jsFile) => {
  const sql = await import(`./${jsFile}`).then((mod) => mod.default);

  const con = mysql.createConnection(
    Object.assign(_.pick(config, ['user', 'password', 'host', 'ssl']), {
      multipleStatements: true,
    }),
  );

  const query = promisify(con.query.bind(con));

  await query(sql);

  con.end();
};
