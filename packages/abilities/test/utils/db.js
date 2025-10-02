import { readFile } from 'node:fs';
import { promisify } from 'node:util';
import mysql from 'mysql2';

export async function create(connection) {
  const client = mysql.createConnection({ ...connection, database: undefined });

  client.connect();

  const { database } = connection;

  await new Promise((rs) => {
    client.query(`DROP DATABASE IF EXISTS ${database}`, rs);
  });

  await new Promise((rs) => {
    client.query(`CREATE DATABASE IF NOT EXISTS ${database}`, rs);
  });

  client.destroy();
}

export async function fixtures(connection, schemas) {
  const conn = mysql.createConnection({
    multipleStatements: true,
    ...connection,
  });

  for (const [schema, path] of Object.entries(schemas)) {
    const sql = await promisify(readFile)(path, { encoding: 'utf8' });

    await promisify(conn.query).call(conn, sql.replace(/\${schema}/g, schema));
  }

  conn.destroy();
}
