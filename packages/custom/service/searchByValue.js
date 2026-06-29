import config from './config.js';

// Custom records whose answers contain ANY of the given values, across every
// form schema — the value search `list` (identifier-only) cannot do. JSON_SEARCH
// matches the value against actual JSON scalars (any field, schema-agnostic)
// rather than a raw-text substring; LIKE wildcards in the value are escaped so
// an email containing `_` matches literally. Paginated by record id as a stable
// cursor (afterId, exclusive): id is the PK, so each page scans forward instead
// of re-scanning from the start as OFFSET would. Returns the record id (cursor),
// the identifier (member userUid) and the form schema id.
export default async function searchByValue(
  value,
  { afterId = 0, limit = 100 } = {},
) {
  if (!config.knex) {
    throw new Error('db connector needs to be specified at service init');
  }

  const values = (Array.isArray(value) ? value : [value])
    .map((v) => String(v).trim())
    .filter(Boolean);
  if (!values.length) return [];

  const rows = await config
    .knex(config.schemas.custom)
    .select(['id', 'identifier', 'form_schema_id'])
    .where((b) => {
      values.forEach((v) => {
        const escaped = v.replace(/[\\%_]/g, '\\$&');
        b.orWhereRaw("JSON_SEARCH(`store`, 'one', ?) IS NOT NULL", [escaped]);
      });
    })
    .where('id', '>', afterId)
    .orderBy('id', 'asc')
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    identifier: r.identifier,
    formSchemaId: r.form_schema_id,
  }));
}
