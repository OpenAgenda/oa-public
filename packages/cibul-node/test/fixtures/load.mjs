import { promisify } from 'node:util';
import _ from 'lodash';
import mysql from 'mysql';

export default async (config, sql) => {
  const con = mysql.createConnection(Object.assign(_.pick(config, ['user', 'password', 'host', 'ssl']), {
    multipleStatements: true,
  }));

  const query = promisify(con.query.bind(con));

  await query(sql);

  con.end();
};
