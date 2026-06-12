// A private (but `indexed: 1`) agenda for the v3 gating test. It is the
// strongest case for the visibility chokepoint: even with the `indexed` flag
// set, it must NEVER surface on v3 — not in the list (the reindex source skips
// private agendas) and not on any `:agendaUid` route (loadAgenda 404s it).
// owner_id 1 reuses a user seeded by 001.sql.js so the FK holds.
//
// The agenda belongs to a (self-contained) network: /me/agendas?detailed=true
// must resolve the ref through the SQL fallback — the regression here was
// `networkUid` missing from the service's default list projection, leaving
// `network: null` for every private agenda.

export default async (knex) => {
  await knex('network').insert([
    {
      id: 990002,
      uid: 990002,
      title: 'Réseau du gating test',
      form_schema_id: null,
      created_at: new Date('2020-04-08T17:00:00'),
      updated_at: new Date('2020-04-08T17:00:00'),
    },
  ]);

  await knex('review').insert([
    {
      id: 990001,
      uid: 990001,
      title: 'Agenda privé (gating test)',
      description: 'Doit être 404 sur toutes les routes de lecture v3',
      slug: 'agenda-prive-gating-test',
      owner_id: 1,
      network_uid: 990002,
      private: 1,
      indexed: 1,
      created_at: new Date('2020-04-08T17:00:00'),
      updated_at: new Date('2020-04-08T17:19:00'),
    },
  ]);
};
