// The operation index behind `search_docs`.
//
// Derived at load time from @openagenda/api-spec (the OpenAPI contract), so the
// catalogue, call signatures, parameters and descriptions always track the
// contract — there is no generated artifact to commit or keep in sync. On top
// of the contract-derived data we merge a small, hand-curated SYNONYMS map: the
// search terms a human would type ("how many", "breakdown", "by id") that the
// contract doesn't carry. Relevance/search is a UX concern, not part of the API
// spec — so it lives here.

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

/**
 * @typedef {object} Operation
 * @property {string} id            operationId (e.g. "agendas.events.list").
 * @property {string} call          How to invoke the method on the `oa` client.
 * @property {string} summary
 * @property {string[]} keywords    Cheap relevance matching for search_docs.
 * @property {string} details       Method + path, description, query params.
 */

// Resolve the contract from the @openagenda/api-spec dependency (which exports
// ./openapi.yaml), not by reaching across the workspace with a relative path —
// so it holds regardless of where the package sits on disk.
const specUrl = import.meta.resolve('@openagenda/api-spec/openapi.yaml');
const spec = parse(readFileSync(new URL(specUrl), 'utf8'));

const resolveRef = (ref) =>
  ref
    .replace(/^#\//, '')
    .split('/')
    .reduce((node, key) => node?.[key], spec);

const deref = (param) => (param.$ref ? resolveRef(param.$ref) : param);

// Words too generic to help relevance matching.
const STOP = new Set([
  'the',
  'a',
  'an',
  'of',
  'to',
  'for',
  'and',
  'or',
  'in',
  'on',
  'by',
  'with',
  'this',
  'that',
  'its',
  'each',
  'all',
  'only',
  'when',
  'from',
  'as',
  'is',
  'are',
  'be',
  'it',
  'you',
  'your',
  'returns',
  'return',
  'one',
  'per',
]);

function keywordsFor(operationId, summary, paramNames) {
  const fromId = operationId.split(/[./]/);
  const fromSummary = String(summary || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP.has(word));
  return [
    ...new Set(
      [...fromId, ...fromSummary, ...paramNames]
        .map((word) => String(word).toLowerCase())
        .filter(Boolean),
    ),
  ];
}

// Curated search synonyms, merged on top of the derived keywords. Keyed by
// operationId. Keep these to the words a user would actually type — the spec
// already contributes the structural keywords (id segments, summary, params).
const SYNONYMS = {
  'agendas.list': ['list', 'agendas', 'directory', 'catalogue', 'catalog'],
  'agendas.get': ['get', 'agenda', 'detail', 'single', 'one', 'by id', 'uid'],
  'agendas.events.list': [
    'list',
    'events',
    'filter',
    'paginate',
    'cursor',
    'when',
    'where',
    'city',
    'date',
  ],
  'agendas.events.get': [
    'get',
    'event',
    'detail',
    'single',
    'one',
    'by id',
    'uid',
  ],
  'agendas.events.facets': [
    'facets',
    'aggregate',
    'count',
    'group',
    'stats',
    'histogram',
    'how many',
    'breakdown',
  ],
};

// Derive the catalogue from the contract. Kept in spec declaration order (list
// before get within each resource): deterministic, reads naturally, and gives
// search a sensible tie-break.
function deriveOperations() {
  const operations = [];

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!op || typeof op !== 'object' || !op.operationId) {
        continue;
      }

      const params = (op.parameters || []).map(deref);
      const pathParams = params
        .filter((p) => p.in === 'path')
        .map((p) => p.name);
      const queryParams = params.filter((p) => p.in === 'query');

      const args = [];
      if (pathParams.length) args.push(`path: { ${pathParams.join(', ')} }`);
      if (queryParams.length) args.push('query');
      const argList = args.length ? `{ ${args.join(', ')} }` : '';
      const call = `oa.${op.operationId}(${argList})`;

      const scopes = (op.security || []).flatMap((req) => req.oauth2 || []);

      const paramLines = queryParams.map(
        (p) =>
          `- ${p.name}: ${String(p.description || '')
            .trim()
            .replace(/\s+/g, ' ')}`,
      );
      const details = [
        `${method.toUpperCase()} ${path}`,
        String(op.description || '').trim(),
        queryParams.length ? `Query parameters:\n${paramLines.join('\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const keywords = keywordsFor(
        op.operationId,
        op.summary,
        queryParams.map((p) => p.name),
      );
      const synonyms = SYNONYMS[op.operationId] ?? [];

      operations.push({
        id: op.operationId,
        method: method.toUpperCase(),
        path,
        call,
        summary: String(op.summary || '').trim(),
        scopes,
        keywords: [...new Set([...keywords, ...synonyms])],
        details,
      });
    }
  }

  return operations;
}

/** @type {Operation[]} */
export const OPERATIONS = deriveOperations();

/** Cheap keyword/substring relevance scan. Returns all ops if nothing matches. */
export function searchOperations(query) {
  const q = String(query ?? '').toLowerCase();
  const scored = OPERATIONS.map((op) => {
    const text = `${op.id} ${op.summary} ${op.keywords.join(' ')}`;
    const haystack = text.toLowerCase();
    // Multi-word keywords ("how many", "by id") are more specific → weigh them higher.
    const kwScore = op.keywords.reduce((s, k) => {
      if (!(q.includes(k) || k.includes(q))) return s;
      return s + (k.includes(' ') ? 2 : 1);
    }, 0);
    const score = kwScore + (haystack.includes(q) ? 1 : 0);
    return { op, score };
  });
  const hits = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return (hits.length ? hits : scored).map((s) => s.op);
}

export function renderOperation(op) {
  return `### ${op.id}\n\`${op.call}\`\n${op.summary}\n\n${op.details}`;
}
