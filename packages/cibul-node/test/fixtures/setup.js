import fs from 'node:fs';
import path from 'node:path';
import knexLib from 'knex';
import migrationDirectories from '../../lib/migrationDirectories.js';

function interpolate(raw, map) {
  let out = raw;
  for (const [key, value] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  }
  return out;
}

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

    const map = { database, ...schemas };
    for (const file of data) {
      const resolved = path.resolve(import.meta.dirname, file);
      if (resolved.endsWith('.sql.js')) {
        const mod = await import(resolved);
        await knex.raw(mod.default);
      } else {
        const raw = fs.readFileSync(resolved, 'utf-8').replace(/;(\n|)$/, '');
        await knex.raw(interpolate(raw, map));
      }
    }
  } finally {
    await knex.destroy();
  }
}
