'use strict';

const fs = require('node:fs');
const path = require('node:path');
const knexLib = require('knex');

const migrationsDir = path.resolve(__dirname, '../../migrations');

function interpolate(raw, map) {
  let out = raw;
  for (const [key, value] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }
  return out;
}

module.exports = async function setup({ mysql, schemas, data = [] }) {
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

    const map = { database, ...schemas };
    for (const file of data) {
      const raw = fs.readFileSync(file, 'utf-8').replace(/;(\n|)$/, '');
      await knex.raw(interpolate(raw, map));
    }
  } catch (err) {
    await knex.destroy().catch(() => {});
    throw err;
  }

  return knex;
};
