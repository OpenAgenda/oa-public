// A private (but `indexed: 1`) agenda for the v3 gating test. It is the
// strongest case for the visibility chokepoint: even with the `indexed` flag
// set, it must NEVER surface on v3 — not in the list (the reindex source skips
// private agendas) and not on any `:agendaUid` route (loadAgenda 404s it).
// owner_id 1 reuses a user seeded by 001.sql.js so the FK holds.

export default async (knex) => {
  await knex('review').insert([
    {
      id: 990001,
      uid: 990001,
      title: 'Agenda privé (gating test)',
      description: 'Doit être 404 sur toutes les routes de lecture v3',
      slug: 'agenda-prive-gating-test',
      owner_id: 1,
      network_uid: null,
      private: 1,
      indexed: 1,
      created_at: new Date('2020-04-08T17:00:00'),
      updated_at: new Date('2020-04-08T17:19:00'),
    },
  ]);
};
