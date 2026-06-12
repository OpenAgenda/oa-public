// Extra membership for the v3 /me/agendas tests (on top of 014.sql.js +
// 90_apiV3_agendas.private.sql.js): janine (user_uid 1) is a CONTRIBUTOR
// (credential 1) on the private agenda 990001 — /me must list it (with
// `private: true`) even though it is absent from the agenda search index.

export default async (knex) => {
  await knex('reviewer').insert([
    {
      agenda_uid: 990001,
      user_uid: 1,
      credential: 1,
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00',
    },
  ]);
};
