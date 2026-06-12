// Extra memberships for the v3 /me/agendas tests (on top of 014.sql.js +
// 90_apiV3_agendas.private.sql.js): janine (user_uid 1) is a CONTRIBUTOR
// (credential 1) on the private agenda 990001 — /me must list it (with
// `private: true`) even though it is absent from the agenda search index.
//
// The second row is STALE: agenda 990404 does not exist (agenda removal
// enqueues the member cleanup as a best-effort task, so such rows occur).
// /me must skip it — not 500 on the search uid filter, not emit an item
// missing the contract's required fields.

export default async (knex) => {
  await knex('reviewer').insert([
    {
      agenda_uid: 990001,
      user_uid: 1,
      credential: 1,
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00',
    },
    {
      agenda_uid: 990404,
      user_uid: 1,
      credential: 1,
      created_at: '2026-01-02 00:00:00',
      updated_at: '2026-01-02 00:00:00',
    },
  ]);
};
