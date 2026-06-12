// Extra location rows for the v3 locations read tests (on top of 014.sql.js):
// agenda 17026855 (id 218) gains an imported location carrying a JSON ext_ids
// entry (extId filter), a soft-deleted one (plain 404) and a merged one
// (404 + `merged` code + `details.mergedIn`).

export default async (knex) => {
  await knex('location').insert([
    {
      id: 990001,
      uid: 99000001,
      agenda_id: 218,
      slug: 'v3-deleted-location',
      placename: 'Deleted location',
      address: '1 rue Disparue, Paris',
      city: 'Paris',
      country: 'FR',
      latitude: 48.85,
      longitude: 2.35,
      store: '{}',
      deleted: 1,
      created_at: '2026-01-01 00:00:00',
      updated_at: '2026-01-01 00:00:00',
    },
    {
      id: 990002,
      uid: 99000002,
      agenda_id: 218,
      slug: 'v3-merged-location',
      placename: 'Merged location',
      address: '2 rue Fusionnée, Paris',
      city: 'Paris',
      country: 'FR',
      latitude: 48.86,
      longitude: 2.36,
      store: '{}',
      deleted: 1,
      merged_in: 123,
      created_at: '2026-01-02 00:00:00',
      updated_at: '2026-01-02 00:00:00',
    },
    {
      id: 990003,
      uid: 99000003,
      agenda_id: 218,
      slug: 'v3-imported-location',
      placename: 'Imported location',
      address: '3 rue Importée, Paris',
      city: 'Paris',
      country: 'FR',
      latitude: 48.87,
      longitude: 2.37,
      store: '{"state":1}',
      ext_ids: '{"identifiers":["import->loc-42"]}',
      created_at: '2026-01-03 00:00:00',
      updated_at: '2026-01-03 00:00:00',
    },
  ]);
};
