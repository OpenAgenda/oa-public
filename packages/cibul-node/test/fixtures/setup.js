import path from 'node:path';
import knexLib from 'knex';
import ensureTemplate from './buildTemplate.js';

const META_TABLE = '__template_meta';

async function listTables(admin, database) {
  const [rows] = await admin.raw(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
    [database],
  );
  return rows.map((r) => r.TABLE_NAME ?? r.table_name);
}

async function readMarker(admin, database) {
  try {
    const [[meta]] = await admin.raw(
      `SELECT hash FROM \`${database}\`.\`${META_TABLE}\` LIMIT 1`,
    );
    return meta?.hash ?? null;
  } catch {
    return null;
  }
}

async function cloneSchema(admin, database, templateDb, tables) {
  await admin.raw(`DROP DATABASE IF EXISTS \`${database}\``);
  await admin.raw(`CREATE DATABASE \`${database}\``);

  const parts = [`USE \`${database}\``, 'SET FOREIGN_KEY_CHECKS=0'];
  for (const table of tables) {
    const [[createRow]] = await admin.raw(
      `SHOW CREATE TABLE \`${templateDb}\`.\`${table}\``,
    );
    parts.push(createRow['Create Table']);
  }
  parts.push('SET FOREIGN_KEY_CHECKS=1');
  await admin.raw(parts.join(';\n'));
}

export default async function setup({ mysql, schemas, data = [] }) {
  const { templateDb, hash } = await ensureTemplate({ mysql, schemas });
  const { database, ...connectionWithoutDb } = mysql;

  const admin = knexLib({
    client: 'mysql2',
    connection: { ...connectionWithoutDb, multipleStatements: true },
  });

  try {
    const tables = await listTables(admin, templateDb);

    if (await readMarker(admin, database) !== hash) {
      await cloneSchema(admin, database, templateDb, tables);
      await admin.raw(
        `CREATE TABLE \`${database}\`.\`${META_TABLE}\` (hash VARCHAR(64) NOT NULL)`,
      );
      await admin.raw(
        `INSERT INTO \`${database}\`.\`${META_TABLE}\` (hash) VALUES (?)`,
        [hash],
      );
    }

    const resetSql = [
      'SET FOREIGN_KEY_CHECKS=0',
      'START TRANSACTION',
      ...tables.flatMap((t) => [
        `DELETE FROM \`${database}\`.\`${t}\``,
        `INSERT INTO \`${database}\`.\`${t}\` SELECT * FROM \`${templateDb}\`.\`${t}\``,
      ]),
      'COMMIT',
      'SET FOREIGN_KEY_CHECKS=1',
    ].join(';\n');
    await admin.raw(resetSql);
  } finally {
    await admin.destroy();
  }

  const knex = knexLib({
    client: 'mysql2',
    connection: { ...mysql, multipleStatements: true },
    schemas,
  });
  try {
    await knex.transaction(async (trx) => {
      for (const file of data) {
        const resolved = path.resolve(import.meta.dirname, file);
        const mod = await import(resolved);
        await mod.default(trx);
      }
    });
  } finally {
    await knex.destroy();
  }
}
