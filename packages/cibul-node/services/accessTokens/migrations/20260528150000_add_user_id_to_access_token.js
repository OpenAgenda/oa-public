// D5b P1 — expand step: introduce `access_token.user_id` so the v2 `tk-` flow
// can resolve the owning user without joining `api_key_set`. Column is nullable
// for now; the dual-write/dual-read code (D5b P2) lands in the same PR and
// keeps `api_key_set_id` populated so a rollback to N-1 remains safe.
//
// Idempotent: the column check guards re-runs, the backfill is scoped to NULL
// rows so it can also be re-run by hand after deploy to catch rows minted by
// the old code during the migration↔bascule window.

export async function up(knex) {
  const { schemas } = knex.client.config;

  const hasColumn = await knex.schema.hasColumn(schemas.accessToken, 'user_id');
  if (!hasColumn) {
    await knex.schema.raw(
      `ALTER TABLE \`${schemas.accessToken}\`
         ADD COLUMN \`user_id\` BIGINT UNSIGNED NULL AFTER \`api_key_set_id\``,
    );
    await knex.schema.raw(
      `CREATE INDEX \`access_token_user_id_idx\`
         ON \`${schemas.accessToken}\` (\`user_id\`)`,
    );
  }

  await knex.raw(
    `UPDATE \`${schemas.accessToken}\` at
       JOIN \`${schemas.apiKeySet}\` s ON s.id = at.api_key_set_id
       SET at.user_id = s.user_id
       WHERE at.user_id IS NULL`,
  );
}

export async function down(knex) {
  const { schemas } = knex.client.config;

  const hasColumn = await knex.schema.hasColumn(schemas.accessToken, 'user_id');
  if (!hasColumn) return;

  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` DROP INDEX \`access_token_user_id_idx\``,
  );
  await knex.schema.raw(
    `ALTER TABLE \`${schemas.accessToken}\` DROP COLUMN \`user_id\``,
  );
}
