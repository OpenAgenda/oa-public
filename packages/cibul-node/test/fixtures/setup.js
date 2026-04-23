import path from 'node:path';
import knexLib from 'knex';
import migrationDirectories from '../../lib/migrationDirectories.js';

export default async function setup({ mysql, schemas, enabled, data = [] }) {
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
    await knex.migrate.latest({ directory: migrationDirectories({ enabled }) });

    for (const file of data) {
      const resolved = path.resolve(import.meta.dirname, file);
      const mod = await import(resolved);
      await mod.default(knex);
    }
  } finally {
    await knex.destroy();
  }
}
