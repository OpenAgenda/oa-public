// Extra location rows for the v3 locations read tests (on top of 014.sql.js):
// agenda 17026855 (id 218) gains an imported location carrying a JSON ext_ids
// entry (extId filter + by-ext get), a soft-deleted one (plain 404, also carrying
// an ext_ids entry so the by-ext get reaches the deleted->plain-404 path) and a
// merged one — itself carrying an ext_ids entry so the by-ext get reaches the
// same `merged` 404 (404 + `merged` code + `details.mergedIn`) as the by-uid get.
// A fourth row lives in ANOTHER agenda (12472, arles) carrying an ext pair that
// exists nowhere in agenda 218, so the by-ext get proves it scopes the lookup to
// the requested agenda (a foreign ext id answers 404, never leaks across).

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
      ext_ids: '{"identifiers":["import->loc-deleted"]}',
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
      ext_ids: '{"identifiers":["import->loc-99"]}',
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
    {
      // Foreign agenda (12472, arles) carrying an ext id absent from agenda 218
      // — a by-ext lookup scoped to AGENDA_UID (218) must never resolve it.
      id: 990004,
      uid: 99000004,
      agenda_id: 12472,
      slug: 'v3-foreign-imported-location',
      placename: 'Foreign imported location',
      address: '4 rue Étrangère, Arles',
      city: 'Arles',
      country: 'FR',
      latitude: 43.67,
      longitude: 4.63,
      store: '{"state":1}',
      ext_ids: '{"identifiers":["import->loc-foreign"]}',
      created_at: '2026-01-04 00:00:00',
      updated_at: '2026-01-04 00:00:00',
    },
  ]);
};
