// Pure mappers: `agendaLocations` service location -> public v3 read shapes.
//
// Two shapes (see public/api-spec/openapi.yaml):
//   - LocationSummary : list `detailed=false` — the service's `list` field
//                       projection (identity + coordinates).
//   - Location        : list `detailed=true` AND the single-get — the
//                       service's `public` field projection.
//
// Naming: the service emits BOTH the legacy aliases (city/district/region/
// department) and the adminLevelN fields reading the same columns; the
// contract keeps the friendly aliases plus adminLevel3/adminLevel5 (the two
// levels without an alias) — same naming as the events' EventLocation
// snapshot. `state` (a 0/1 "verified" flag with an opaque name) is exposed as
// the boolean `verified`.
//
// The legacy tagSet is the locations' equivalent of the events' agenda-
// specific fields, so it is exposed under the SAME name: `additionalFields`,
// today carrying a single `tags` key (the schema-valid tags the service
// filtered via the agenda's merged form schema). When the backend converges
// legacy tags into real additional fields, new keys join non-breakingly.
//
// Deliberately NOT exposed: `extId` (legacy singular duplicate of extIds),
// `duplicateCandidates`/`disqualifiedDuplicates` (internal moderation
// tooling), `imageRightsAreHeld` (write-side compliance flag),
// `mergedIn`/`deleted` (deleted records 404 — see the route).
//
// Empty-as-empty rule: every field of a shape is always present; localized
// maps -> `{}`, arrays -> `[]`, singular optional values -> `null`.

// Date|string -> ISO string. The SQL layer returns Date objects.
const toIso = (v) => {
  if (v == null) return null;
  return v instanceof Date ? v.toISOString() : String(v);
};

// DECIMAL columns may surface as strings depending on the driver; the
// contract wants numbers.
const toNumber = (v) => (v == null ? null : Number(v));

const orNull = (v) => (v === undefined || v === '' ? null : v);

const localizedMap = (v) =>
  (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

// The extIds entries expose exactly these keys (see the mapper below).
const EXT_ID_KEYS = ['key', 'value'];

// Selection descriptor for `?fields=` (see lib/selectFields.js). Two fields are
// renamed onto their service columns for the SQL pushdown: the opaque `state`
// flag is exposed as `verified`, and the `additionalFields` bag is backed by
// the single `tags` column (so selecting it — or its `tags` sub-key — projects
// `tags`). Pushdown is top-level (one SQL column per field).
//
// `additionalFields` is deliberately NOT in `children`: it is an OPEN container
// (the contract documents it as gaining agenda-defined keys non-breakingly), so
// its leaves stay best-effort — same as the events `additionalFields` bag —
// rather than 400-ing a future custom key.
export const LOCATION_SELECT = {
  granularity: 'top',
  store: { verified: 'state', additionalFields: 'tags' },
  children: {
    extIds: EXT_ID_KEYS,
  },
};

export function mapLocationSummary(location) {
  return {
    uid: location.uid,
    name: location.name,
    address: orNull(location.address),
    latitude: toNumber(location.latitude),
    longitude: toNumber(location.longitude),
    verified: !!location.state,
  };
}

export default function mapLocation(location) {
  return {
    uid: location.uid,
    slug: location.slug,
    setUid: location.setUid ?? null,
    name: location.name,
    address: orNull(location.address),
    city: orNull(location.city),
    district: orNull(location.district),
    region: orNull(location.region),
    department: orNull(location.department),
    adminLevel3: orNull(location.adminLevel3),
    adminLevel5: orNull(location.adminLevel5),
    postalCode: orNull(location.postalCode),
    insee: orNull(location.insee),
    countryCode: orNull(location.countryCode),
    latitude: toNumber(location.latitude),
    longitude: toNumber(location.longitude),
    timezone: orNull(location.timezone),
    description: localizedMap(location.description),
    access: localizedMap(location.access),
    image: orNull(location.image),
    imageCredits: orNull(location.imageCredits),
    website: orNull(location.website),
    email: orNull(location.email),
    phone: orNull(location.phone),
    links: Array.isArray(location.links) ? location.links : [],
    extIds: Array.isArray(location.extIds)
      ? location.extIds.map(({ key, value }) => ({ key, value: value ?? null }))
      : [],
    additionalFields: {
      tags: Array.isArray(location.tags)
        ? location.tags.map(({ id, label }) => ({ id, label }))
        : [],
    },
    siret: orNull(location.siret),
    verified: !!location.state,
    createdAt: toIso(location.createdAt),
    updatedAt: toIso(location.updatedAt),
  };
}
