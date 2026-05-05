// Backfill `user.google_id` and `user.facebook_uid` into `account` rows so
// existing OAuth users keep working under better-auth's `findOAuthUser`
// lookup (which matches by `(provider_id, account_id)`). Phase 4 lot 1.
//
// Idempotent via the unique index on (provider_id, account_id) — re-runs
// and overlap with runtime account creations from phase 4 lot 4 are no-ops.
// `password` stays null on OAuth rows; only `credential` rows carry one.
//
// Note on rollback: `down()` deletes every google/facebook account row with
// password IS NULL — including any created at runtime by BA after lot 4.
// In practice rollback is only meaningful before lot 4 ships, so this is
// acceptable; documented here so it's not a surprise.

const INSERT_CHUNK = 1000;

export async function up(knex) {
  const { schemas } = knex.client.config;
  const { user, account } = schemas;

  const rows = await knex(user)
    .select('id', 'google_id', 'facebook_uid')
    .where('is_removed', 0)
    .andWhere((qb) => {
      qb.whereNotNull('google_id').orWhereNotNull('facebook_uid');
    });

  const now = new Date();
  const inserts = [];
  for (const row of rows) {
    if (row.google_id) {
      inserts.push({
        user_id: row.id,
        account_id: String(row.google_id),
        provider_id: 'google',
        password: null,
        created_at: now,
        updated_at: now,
      });
    }
    if (row.facebook_uid) {
      inserts.push({
        user_id: row.id,
        account_id: String(row.facebook_uid),
        provider_id: 'facebook',
        password: null,
        created_at: now,
        updated_at: now,
      });
    }
  }

  for (let i = 0; i < inserts.length; i += INSERT_CHUNK) {
    await knex(account)
      .insert(inserts.slice(i, i + INSERT_CHUNK))
      .onConflict(['provider_id', 'account_id'])
      .ignore();
  }
}

export async function down(knex) {
  const { schemas } = knex.client.config;
  await knex(schemas.account)
    .whereIn('provider_id', ['google', 'facebook'])
    .whereNull('password')
    .delete();
}
