/* eslint-disable no-console */

import '../lib/defineEnv.js';

import knexLib from 'knex';
import config from '../config/index.js';
import migrationDirectories from '../lib/migrationDirectories.js';

const knex = knexLib({
  client: 'mysql2',
  connection: { ...config.db },
  pool: { min: 1, max: 2 },
  schemas: config.schemas,
});

try {
  const [batch, applied] = await knex.migrate.latest({
    directory: migrationDirectories(),
  });

  if (applied.length === 0) {
    console.log('already up to date');
  } else {
    console.log(`applied batch ${batch} (${applied.length} migrations)`);
    for (const file of applied) console.log(`  • ${file}`);
  }

  await knex.destroy();
  process.exit(0);
} catch (err) {
  console.error('migration failed:', err);
  await knex.destroy().catch(() => {});
  process.exit(1);
}
