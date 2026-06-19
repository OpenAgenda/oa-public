// Pure mappers: projected `core` agenda -> public v3 agenda read shapes.
//
// Three distinct shapes, each reflecting what its source returns (see
// public/api-spec/openapi.yaml):
//   - AgendaSummary   : list `detailed=false` — search-index base projection.
//   - AgendaDetailed  : list `detailed=true`  — search-index detailed projection
//                       (base + createdAt + network + locationSet). Narrower
//                       than the single-get: the ES index does not carry
//                       url/updatedAt/officializedAt/private/indexed.
//   - Agenda          : single-get — the full SQL record.
//
// Empty-as-empty rule: every field of a shape is always present; singular
// optional values are `null` when absent. `official` is coerced to a boolean.

// Date|string -> ISO string. core's SQL get returns Date objects (it only
// pre-serializes when `serializable` is set, which the route does not); the ES
// search already returns ISO strings. Coerce both to a string.
const toIso = (v) => {
  if (v == null) return null;
  return v instanceof Date ? v.toISOString() : String(v);
};

// The two ref relations expose exactly these keys (see refOrNull).
const REF_KEYS = ['uid', 'title'];

// A network / locationSet relation -> compact `{ uid, title }` ref, or `null`.
// Drops any extra indexed/SQL fields (e.g. network.formSchemaId) so only the
// contract shape leaks.
function refOrNull(rel) {
  if (!rel || rel.uid == null) {
    return null;
  }
  return { uid: rel.uid, title: rel.title ?? null };
}

// Selection descriptor for `?fields=` (see lib/selectFields.js): the network/
// locationSet refs are the only nested objects. Pushdown is top-level
// (`onlyIncludeFields` projects the whole subtree), with no per-field renames
// or derived deps — the AgendaDetailed names map 1:1 onto the index fields.
export const AGENDA_SELECT = {
  granularity: 'top',
  children: {
    network: REF_KEYS,
    locationSet: REF_KEYS,
  },
};

// The fields shared by every shape (the search-index base projection).
function base(agenda) {
  return {
    uid: agenda.uid,
    slug: agenda.slug,
    title: agenda.title,
    description: agenda.description ?? null,
    image: agenda.image ?? null,
    official: !!agenda.official,
  };
}

export function mapAgendaSummary(agenda) {
  return base(agenda);
}

export function mapAgendaDetailed(agenda) {
  return {
    ...base(agenda),
    createdAt: toIso(agenda.createdAt),
    network: refOrNull(agenda.network),
    locationSet: refOrNull(agenda.locationSet),
  };
}

export default function mapAgenda(agenda) {
  return {
    ...base(agenda),
    url: agenda.url ?? null,
    createdAt: toIso(agenda.createdAt),
    updatedAt: toIso(agenda.updatedAt),
    officializedAt: toIso(agenda.officializedAt),
    private: !!agenda.private,
    indexed: !!agenda.indexed,
    network: refOrNull(agenda.network),
    locationSet: refOrNull(agenda.locationSet),
  };
}
