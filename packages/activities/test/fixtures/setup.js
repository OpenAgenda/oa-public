'use strict';

const fs = require('node:fs');
const path = require('node:path');
const knexLib = require('knex');

const activitiesMigrationsDir = path.resolve(__dirname, '../../migrations');

const DEFAULT_DATA = [
  `${__dirname}/activity.data.sql`,
  `${__dirname}/feed.data.sql`,
  `${__dirname}/feed_activity.data.sql`,
  `${__dirname}/feed_follow.data.sql`,
  `${__dirname}/feed_notification.data.sql`,
];

function interpolate(raw, map) {
  let out = raw;
  for (const [key, value] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }
  return out;
}

async function runData(knex, data, schemas) {
  for (const file of data) {
    const raw = fs.readFileSync(file, 'utf-8').replace(/;(\n|)$/, '');
    await knex.raw(interpolate(raw, schemas));
  }
}

module.exports = async function setup({
  mysql,
  schemas,
  data = DEFAULT_DATA,
  migrations = [activitiesMigrationsDir],
}) {
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
    await knex.migrate.latest({ directory: migrations });
    await runData(knex, data, schemas);
  } catch (err) {
    await knex.destroy().catch(() => {});
    throw err;
  }

  return knex;
};

module.exports.reset = async function reset(
  knex,
  { data = DEFAULT_DATA } = {},
) {
  const { schemas } = knex.client.config;
  const tables = data.map((file) => schemas[path.basename(file).split('.')[0]]);

  await knex.transaction(async (trx) => {
    await trx.raw('SET foreign_key_checks = 0');
    for (const table of tables) {
      if (table) await trx(table).truncate();
    }
    await trx.raw('SET foreign_key_checks = 1');
  });

  await runData(knex, data, schemas);
};
