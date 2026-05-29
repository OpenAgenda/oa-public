// Pure mappers: projected `core` event (ES `_source`-derived) -> public v3
// `EventSummary` (list) / `Event` (single get).
//
// The list (`detailed: false`) and the get (`detailed: true`) genuinely return
// different field sets, so the contract splits into two flat schemas:
//   - EventSummary: the base include set (searchIncludes.json "base").
//   - Event: the base set PLUS the detailed-only fields.
//
// Empty-as-empty rule (NOT omit, NOT uniform-null): every field of a schema is
// ALWAYS present.
//   - collections (arrays, localized maps) -> never null/omitted: `[]` / `{}`.
//   - singular optional objects (image, location, age, accessibility,
//     originAgenda, first/last/nextTiming, country) -> `null` when absent.
//   - nullable scalars (imageCredits, onlineAccessLink) -> `null` when absent.
//   - plain scalars pass through; `featured` is always a boolean.
//
// Native keys are emitted (coerced) per their kind; internal/moderation keys
// are dropped; every remaining key is an agenda-specific custom field and goes
// under `custom`. The result satisfies `additionalProperties: false`.

// Field kinds drive coercion. Keys map to one of:
//   'array'    -> array, [] when absent
//   'map'      -> localized object map (LocalizedString/Array), {} when absent
//   'object'          -> nullable object, null when absent
//   'nullable-scalar' -> nullable scalar, null when absent (imageCredits, timezone…)
//   'scalar'          -> required scalar, passed through (real data always provides it)
//   'boolean'         -> coerced to a boolean
// Nested objects/arrays are then allowlist-cleaned (see CLEANERS) so internal
// subfields never leak.

// Base (EventSummary) field set: searchIncludes.json "base".
const BASE_FIELDS = {
  uid: 'scalar',
  slug: 'scalar',
  title: 'map',
  description: 'map',
  status: 'scalar',
  dateRange: 'map',
  featured: 'boolean',
  image: 'object',
  imageCredits: 'nullable-scalar',
  keywords: 'map',
  originAgenda: 'object',
  timings: 'array',
  location: 'object',
  timezone: 'nullable-scalar',
  attendanceMode: 'scalar',
  onlineAccessLink: 'nullable-scalar',
  firstTiming: 'object',
  lastTiming: 'object',
  nextTiming: 'object',
};

// Detailed-only fields, added on top of the base set for `Event`.
const DETAILED_FIELDS = {
  longDescription: 'map',
  conditions: 'map',
  country: 'object',
  registration: 'array',
  createdAt: 'scalar',
  updatedAt: 'scalar',
  accessibility: 'object',
  age: 'object',
  state: 'scalar',
  links: 'array',
  extIds: 'array',
  sourceAgendas: 'array',
};

const FULL_FIELDS = { ...BASE_FIELDS, ...DETAILED_FIELDS };

// Internal / moderation keys that must never be exposed publicly.
// `valid` is an internal validation flag the search `get` appends explicitly.
const DROP_KEYS = new Set([
  'id',
  'fileKey',
  'deletedAt',
  'addMethod',
  'motive',
  'member',
  'html',
  'creatorUid',
  'ownerUid',
  'private',
  'draft',
  'removed',
  'agenda',
  'agendaUid',
  '_agg',
  '_search_begin_from_midnight',
  'recurring',
  'aggregated',
  'sourcePaths',
  'valid',
]);

function isEmptyValue(value) {
  if (value == null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
}

// Nested objects are cleaned by ALLOWLIST (default-deny): only the keys declared
// in the contract's sub-schemas are emitted, so internal/aggregation fields
// (`_agg`, `disqualifiedDuplicates`, `tags`, `indexed`, `officializedAt`, agenda
// `private`/`description`, …) never leak through the open-by-nature ES `_source`.
function pick(obj, keys) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }
  const out = {};
  for (const key of keys) {
    if (obj[key] !== undefined) {
      out[key] = obj[key];
    }
  }
  return out;
}

const LOCATION_KEYS = [
  'uid',
  'name',
  'address',
  'city',
  'region',
  'postalCode',
  'countryCode',
  'latitude',
  'longitude',
  'district',
  'department',
  'adminLevel3',
  'adminLevel5',
  'country',
  'timezone',
];
const AGENDA_REF_KEYS = ['uid', 'title', 'slug', 'image', 'url', 'official'];
const IMAGE_KEYS = ['filename', 'base', 'credits', 'size', 'variants'];
const IMAGE_VARIANT_KEYS = ['type', 'filename', 'size'];
const SIZE_KEYS = ['width', 'height'];
const REGISTRATION_KEYS = ['type', 'value'];
const ENRICHED_LINK_KEYS = ['link', 'data'];
const EXT_ID_KEYS = ['key', 'value'];

const cleanSize = (s) => (s && typeof s === 'object' ? pick(s, SIZE_KEYS) : s);
// Exported so the provenance facets (facets.js) emit the same AgendaRef shape
// as events' originAgenda/sourceAgendas.
export const cleanAgendaRef = (a) => pick(a, AGENDA_REF_KEYS);

function cleanImage(img) {
  const out = pick(img, IMAGE_KEYS);
  if (out.size != null) {
    out.size = cleanSize(out.size);
  }
  if (Array.isArray(out.variants)) {
    out.variants = out.variants.map((v) => {
      const variant = pick(v, IMAGE_VARIANT_KEYS);
      if (variant.size != null) {
        variant.size = cleanSize(variant.size);
      }
      return variant;
    });
  }
  return out;
}

// Per-field allowlist cleaners, applied after coercion to a non-null value.
const CLEANERS = {
  location: (l) => pick(l, LOCATION_KEYS),
  originAgenda: cleanAgendaRef,
  sourceAgendas: (arr) => arr.map(cleanAgendaRef),
  image: cleanImage,
  registration: (arr) => arr.map((r) => pick(r, REGISTRATION_KEYS)),
  links: (arr) => arr.map((l) => pick(l, ENRICHED_LINK_KEYS)),
  extIds: (arr) => arr.map((e) => pick(e, EXT_ID_KEYS)),
};

// Coerce a single native value by its declared kind, applying the
// empty-as-empty rule.
function coerce(kind, value) {
  switch (kind) {
    case 'array':
      return Array.isArray(value) ? value : [];
    case 'map':
      return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
    case 'object':
      return isEmptyValue(value) ? null : value;
    case 'boolean':
      return Boolean(value);
    case 'nullable-scalar':
      return value == null ? null : value;
    case 'scalar':
    default:
      // Required scalar: pass through. Absent stays absent so the contract's
      // `required` surfaces a genuine gap (real data always provides these).
      return value;
  }
}

// Shared core: project `projectedEvent` onto the given native field set.
// Native fields are coerced and emitted (always present); dropped keys are
// skipped; everything else lands under `custom`.
//
// `fields` is the field set THIS view emits. `knownNative` is the full set of
// native top-level keys: a key that is native but not in this view (e.g. a
// detailed field on a summary) is neither emitted nor treated as custom — it is
// simply not part of this view.
function mapWithFields(projectedEvent, fields, knownNative = fields) {
  if (projectedEvent == null || typeof projectedEvent !== 'object') {
    throw new TypeError('mapEvent expects a projected event object');
  }

  const result = {};
  const custom = {};

  // Guarantee every field of the schema is present (the input may omit some,
  // e.g. a list projection or a sparse event) by seeding from the field set.
  // Nested objects/arrays are then allowlist-cleaned so internal subfields
  // don't leak through the open ES `_source`.
  for (const [key, kind] of Object.entries(fields)) {
    let value = coerce(kind, projectedEvent[key]);
    if (value != null && CLEANERS[key]) {
      value = CLEANERS[key](value);
    }
    result[key] = value;
  }

  // Route any remaining (non-native, non-dropped) key into `custom`.
  for (const [key, value] of Object.entries(projectedEvent)) {
    if (key in knownNative || DROP_KEYS.has(key)) {
      continue;
    }
    custom[key] = value;
  }

  result.custom = custom;

  return result;
}

// EventSummary mapper (list): base field set only. Detailed-only native keys
// (should `core` ever emit them on a list projection) are recognized as native
// and excluded from this view rather than leaking into `custom`.
export function mapEventSummary(projectedEvent) {
  return mapWithFields(projectedEvent, BASE_FIELDS, FULL_FIELDS);
}

// Event mapper (single get): base + detailed field sets.
export default function mapEvent(projectedEvent) {
  return mapWithFields(projectedEvent, FULL_FIELDS);
}
