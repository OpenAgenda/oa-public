import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import knexLib from 'knex';
import migrationDirectories from '../../lib/migrationDirectories.js';

function hashMigrations(dirs) {
  const hasher = crypto.createHash('sha1');
  for (const dir of dirs) {
    const files = fs.readdirSync(dir).sort();
    for (const file of files) {
      hasher.update(`${dir}/${file}\n`);
      hasher.update(fs.readFileSync(path.join(dir, file)));
    }
  }
  return hasher.digest('hex').slice(0, 12);
}

export default async function ensureTemplate({ mysql, schemas }) {
  const dirs = migrationDirectories({ disabled: ['crossService'] });
  const hash = hashMigrations(dirs);
  const templateDb = `${mysql.database}_template_${hash}`;
  const { database, ...connectionWithoutDb } = mysql;

  const bootstrap = knexLib({
    client: 'mysql2',
    connection: { ...connectionWithoutDb, multipleStatements: true },
  });

  try {
    const [existing] = await bootstrap.raw('SHOW DATABASES LIKE ?', [
      templateDb,
    ]);
    if (existing.length > 0) return { templateDb, hash };

    await bootstrap.raw(`CREATE DATABASE \`${templateDb}\``);
  } finally {
    await bootstrap.destroy();
  }

  const knex = knexLib({
    client: 'mysql2',
    connection: { ...mysql, database: templateDb, multipleStatements: true },
    schemas,
  });
  try {
    await knex.migrate.latest({ directory: dirs });
  } finally {
    await knex.destroy();
  }

  return { templateDb, hash };
}
