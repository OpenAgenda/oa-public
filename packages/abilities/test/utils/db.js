import { readFile } from 'fs';
import { promisify } from 'util';
import mysql from 'mysql';

async function create({ user, password, database }) {
  const conn = mysql.createConnection({ user, password });

  await promisify(conn.query).call(conn, `DROP DATABASE IF EXISTS ${database}`);
  await promisify(conn.query).call(
    conn,
    `CREATE DATABASE IF NOT EXISTS ${database}`
  );

  conn.destroy();
}

async function fixtures({ user, password, database }, schemas) {
  const conn = mysql.createConnection({
    multipleStatements: true,
    user,
    password,
    database
  });

  for (const [schema, path] of Object.entries(schemas)) {
    const sql = await promisify(readFile)(path, { encoding: 'utf8' });

    await promisify(conn.query).call(conn, sql.replace(/\${schema}/g, schema));
  }

  conn.destroy();
}

module.exports = {
  create,
  fixtures
};
