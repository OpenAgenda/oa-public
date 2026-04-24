import fs from 'node:fs';
import path from 'node:path';
import knexLib from 'knex';

const migrationsDir = path.resolve(import.meta.dirname, '../../migrations');

function interpolate(raw, map) {
  let out = raw;
  for (const [key, value] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }
  return out;
}

function loadSql(files, schemas) {
  return files.map((file) => {
    const raw = fs.readFileSync(file, 'utf-8').replace(/;(\n|)$/, '');
    return interpolate(raw, schemas);
  });
}

export default async function setup({ mysql, schemas, data = [] }) {
  const { database, ...connectionWithoutDb } = mysql;

  const bootstrap = knexLib({
    client: 'mysql2',
    connection: { ...connectionWithoutDb, multipleStatements: true },
  });
  try {
    await bootstrap.raw(`DROP DATABASE IF EXISTS \`${database}\``);
    await bootstrap.raw(`CREATE DATABASE \`${database}\``);
  } finally {
    await bootstrap.destroy();
  }

  const knex = knexLib({
    client: 'mysql2',
    connection: { ...mysql, multipleStatements: true },
    schemas,
  });

  try {
    await knex.migrate.latest({ directory: migrationsDir });

    for (const sql of loadSql(data, schemas)) {
      await knex.raw(sql);
    }
  } catch (err) {
    await knex.destroy().catch(() => {});
    throw err;
  }

  return knex;
}

export async function reset(knex, { schemas, data }) {
  const tables = data.map((file) => schemas[path.basename(file).split('.')[0]]);

  await knex.transaction(async (trx) => {
    await trx.raw('SET foreign_key_checks = 0');
    for (const table of tables) {
      await trx(table).truncate();
    }
    await trx.raw('SET foreign_key_checks = 1');
  });

  for (const sql of loadSql(data, schemas)) {
    await knex.raw(sql);
  }
}
