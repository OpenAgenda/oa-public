// D2 backfill — historically copied every legacy `key` row into the better-auth
// `apikey` store (D1). At D5a the source table `key` is dropped and the mirror
// helper that did the hashing/insert was removed with `packages/keys`. This
// migration is left as a no-op forward in `legacy/` so knex's basename ledger
// stays consistent on existing DBs (where it already ran) and fresh DBs (where
// the very next migration drops the `key` table anyway, so backfilling an empty
// source is pointless).
//
// Down is also a no-op: the mirror rows it would have removed are gone with
// the source table at the next migration's `down` boundary.

export async function up() {
  // no-op
}

export async function down() {
  // no-op
}
