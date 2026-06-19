// OpenAgenda v3 API — read endpoints for agendas, events and locations.
//
// Thin HTTP mapping layer over `core`:
//   GET /agendas                             -> { data: [AgendaSummary|AgendaDetailed], pagination }
//   GET /agendas/:agendaUid                  -> bare Agenda (full)
//   GET /agendas/:agendaUid/events           -> { data: [Event...], pagination }
//   GET /agendas/:agendaUid/events/:eventUid -> bare Event
//   GET /agendas/:agendaUid/events/schema    -> raw merged event form schema
//   GET /agendas/:agendaUid/locations        -> { data: [LocationSummary|Location], pagination }
//   GET /agendas/:agendaUid/locations/:locationUid -> bare Location (full)
//   GET /me/agendas                          -> { data: [MeAgendaItem], pagination }
//
// Auth (createAuthenticate) and agenda loading (createLoadAgenda) are
// v3-native: they throw typed errors into the v3 error envelope. The contract
// is `public/api-spec/openapi.yaml`.

import express from 'express';
import { BadRequest, NotAuthenticated, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import sentryErrorHandler from '../lib/sentryErrorHandler.js';
import loadSearchAccess from '../core/agendas/events/lib/loadSearchAccess.js';
import createAuthenticate from './lib/authenticate.js';
import requireScope from './lib/requireScope.js';
import createLoadAgenda from './lib/loadAgenda.js';
import mapEvent from './lib/mapEvent.js';
import mapAgenda from './lib/mapAgenda.js';
import mapLocation from './lib/mapLocation.js';
import buildListEnvelope from './lib/envelope.js';
import buildAgendaListEnvelope from './lib/agendaEnvelope.js';
import buildLocationListEnvelope from './lib/locationEnvelope.js';
import buildEventSearchQuery from './lib/buildEventSearchQuery.js';
import buildAgendaSearchQuery from './lib/buildAgendaSearchQuery.js';
import buildLocationListQuery from './lib/buildLocationListQuery.js';
import {
  locationEndpoints,
  loadLocationFormSchema,
} from './lib/agendaLocations.js';
import buildMeAgendaList from './lib/meAgendas.js';
import {
  parseFacets,
  parseFacetSize,
  parseFacetSizes,
  parseFacetSort,
  parseFacetSorts,
  parseFacetMissing,
  parseGeohashZoom,
  parseTimingsInterval,
  parseMonthWindow,
  parseFieldKeys,
  resolveAdditionalFieldSelections,
  isReadableAt,
  buildAggregations,
  mapFacets,
  parseFacetSpecs,
  buildReportAggregations,
  mapFacetReport,
} from './lib/facets.js';
import { decodeCursor, decodeIntCursor } from './lib/cursor.js';
import apiV3ErrorHandler from './errorHandler.js';

const log = logs('api-v3');

// Contract: limit default 20, min 1, max 100.
const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

// Resolve `?limit`. Absent → the default (an omission is not an invalid value).
// Anything else must be an integer within [MIN_LIMIT, MAX_LIMIT]: a non-integer
// or an out-of-range value is a 400, never a silent coercion. Clamping
// `limit=300` down to 100 would hand back a truncated page that looks complete
// to the caller — hiding data with no signal. Rejecting is consistent with the
// `detailed`/`sort` gate (an out-of-contract value is a bad request) and means
// the cap is real: cursor pagination is how bulk/sync reads many pages, not a
// single oversized one.
function resolveLimit(rawLimit) {
  if (rawLimit === undefined) {
    return DEFAULT_LIMIT;
  }
  const value = Number(rawLimit);
  if (!Number.isInteger(value) || value < MIN_LIMIT || value > MAX_LIMIT) {
    throw new BadRequest(
      {
        info: {
          errors: [
            {
              field: 'limit',
              message: `limit must be an integer between ${MIN_LIMIT} and ${MAX_LIMIT}`,
            },
          ],
        },
      },
      'Invalid query parameters',
    );
  }
  return value;
}

// Contract: the `/agendas` list `?sort` allowlist. `createdAt.desc` is the
// stable browse default — an immutable keyset, ideal for the search_after
// cursor. `recentlyAddedEvents.desc` is opt-in discovery: it ranks on a
// volatile boolean (`_recentlyAddedEvents`), so its keyset drifts — shallow
// pagination only. Relevance (`_score`) is NOT a `?sort` value: it is the
// implicit default when `?search` is present, obtained by passing no sort to
// agenda-search (its own search default). Mirrors agenda-search's nav
// validator regex, but as an explicit route-owned gate with a v3 400 envelope.
const AGENDA_SORTS = new Set(['createdAt.desc', 'recentlyAddedEvents.desc']);

// Parse `?sort` on the agenda list. `undefined` → no explicit sort (the
// conditional default applies). A value outside the allowlist is a 400, like
// `detailed` — a sort the contract doesn't offer is a bad request, not a
// silently-ignored filter.
function resolveAgendaSort(rawSort) {
  if (rawSort === undefined) {
    return undefined;
  }
  if (typeof rawSort === 'string' && AGENDA_SORTS.has(rawSort)) {
    return rawSort;
  }
  throw new BadRequest(
    {
      info: {
        errors: [
          {
            field: 'sort',
            message: `sort must be one of: ${[...AGENDA_SORTS].join(', ')}`,
          },
        ],
      },
    },
    'Invalid query parameters',
  );
}

// `detailed` is a strict boolean view toggle (contract default `false`): when
// true, list items are the full `Event` instead of `EventSummary`. Unlike the
// filters (which the translator ignores when unknown), a malformed boolean here
// is a 400 — a view param that isn't `true`/`false` is a bad request.
function resolveDetailed(rawDetailed) {
  if (rawDetailed === undefined || rawDetailed === 'false') {
    return false;
  }
  if (rawDetailed === 'true') {
    return true;
  }
  throw new BadRequest(
    {
      info: {
        errors: [
          { field: 'detailed', message: 'detailed must be "true" or "false"' },
        ],
      },
    },
    'Invalid query parameters',
  );
}

export default function instanciateApiV3(core, { useRouter = true } = {}) {
  log('init');

  const app = useRouter ? express.Router() : express();

  // Mirror api/index.js so reused middleware can read req.app.core/services.
  app.core = core;
  app.services = core.services;

  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // JSON body parser for the write/analytical surfaces (the facets report POST).
  // Harmless for the GET reads (no body). A malformed JSON body surfaces as a
  // 400 through the v3 error handler.
  app.use(express.json());

  // Auth resolution (publicKey / agenda-key / access token). Throws typed
  // errors (401 NotAuthenticated / 403 Forbidden) into the v3 error envelope.
  // Wired for both verbs the surface uses (GET reads, POST facets report).
  app.get('*', createAuthenticate(core));
  app.post('*', createAuthenticate(core));

  // Load the agenda for any route exposing :agendaUid, throwing typed errors
  // into the v3 envelope (see lib/loadAgenda.js).
  app.param('agendaUid', createLoadAgenda(core));

  // OAuth scope gate (O4a): each route below declares the scope the contract
  // requires of a scope-bearing caller (`security.oauth2` in
  // public/api-spec/openapi.yaml). requireScope constrains scoped credentials
  // — OAuth tokens, and API keys carrying explicit `permissions` — while
  // unscoped ones (grandfathered keys with no permissions, agenda keys,
  // sessions) pass through. A missing scope answers 403 insufficient_scope.

  // GET /agendas
  // Cursor-paginated agenda list (ES agenda search). `detailed=false` →
  // AgendaSummary, `detailed=true` → AgendaDetailed (the index's detailed
  // projection: + createdAt/network/locationSet). The full canonical record
  // lives on the single-get only (the index does not carry url/updatedAt/
  // officializedAt/private/indexed — hence distinct shapes, not one schema).
  app.get('/agendas', requireScope('agendas:read'), async (req, res, next) => {
    try {
      const limit = resolveLimit(req.query.limit);
      const detailed = resolveDetailed(req.query.detailed);

      const query = buildAgendaSearchQuery(req.query);

      // Sort resolution. Explicit `?sort` (allowlist) wins; else relevance
      // (`_score`) when `?search` is present — obtained by passing NO sort, so
      // agenda-search takes its own search default instead of the previous
      // hard-coded `createdAt.desc` that silently buried text matches; else the
      // stable `createdAt.desc` browse order. The cursor's pinned sort (below)
      // wins over all of this so a page sequence stays coherent.
      const nav = { size: limit };
      const sort = resolveAgendaSort(req.query.sort);
      if (sort) {
        nav.sort = sort;
      } else if (query.search === undefined) {
        nav.sort = 'createdAt.desc';
      }

      if (req.query.after !== undefined) {
        const decoded = decodeCursor(req.query.after);
        if (decoded) {
          nav.after = decoded.after;
          // The cursor pins the sort that produced the previous page. Re-check
          // it against the allowlist: a forged cursor must not smuggle an
          // out-of-contract sort into core (an unknown key 500s in queryToDSL).
          if (decoded.sort && AGENDA_SORTS.has(decoded.sort)) {
            nav.sort = decoded.sort;
          }
        }
      }

      // Public discovery list: 'public' projection (the AgendaSummary/Detailed
      // field sets are all public-read) and the search's `indexed` default
      // (true) keeps unindexed agendas out.
      const result = await core.agendas.search(query, nav, {
        detailed,
        access: 'public',
      });

      res.json(buildAgendaListEnvelope(result, { limit, detailed }));
    } catch (err) {
      next(err);
    }
  });

  // GET /agendas/:agendaUid
  // Single agenda, full `Agenda` record (SQL get). `detailed: true` resolves
  // the `network`/`locationSet` refs. Registered before the deeper
  // `/agendas/:agendaUid/events*` routes; it only matches the 2-segment path.
  app.get(
    '/agendas/:agendaUid',
    requireScope('agendas:read'),
    async (req, res, next) => {
      try {
        const agenda = await core
          .agendas(req.agenda.uid)
          .get({ detailed: true, access: 'public' });

        if (!agenda) {
          throw new NotFound(
            { info: { uid: req.agenda.uid } },
            'agenda not found',
          );
        }

        res.json(mapAgenda(agenda));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /agendas/:agendaUid/events
  app.get(
    '/agendas/:agendaUid/events',
    requireScope('events:read'),
    async (req, res, next) => {
      try {
        const limit = resolveLimit(req.query.limit);
        const detailed = resolveDetailed(req.query.detailed);

        const nav = { size: limit };

        const query = buildEventSearchQuery(req.query);

        // Filters are not encoded in the cursor; the cursor only carries the
        // position and the sort that produced the previous page, so the sort
        // it pins wins over any `?sort` on a follow-up request.
        if (req.query.after !== undefined) {
          const decoded = decodeCursor(req.query.after);
          if (decoded) {
            nav.after = decoded.after;
            if (decoded.sort) query.sort = decoded.sort;
          }
        }

        // A public read path MUST declare its access level. core's loadSearchAccess
        // returns `null` for an anonymous/pk caller, and `defineIncludes` treats a
        // null access as "trusted caller, no field restriction" (by design —
        // internal callers rely on it). Left as null, an anonymous reader would get
        // restricted (read-gated) additional fields projected. So pin it to the
        // resolved level, coercing null → 'public'. (Visibility is unchanged: the
        // published-only default comes from validateQuery's `state` default, not
        // from access; the single-event GET already forces 'internal' in core.)
        const access = await loadSearchAccess(core, req.agenda.uid, {
          userUid: req.user?.uid,
          agendaKey: req.agendaKey,
        }) ?? 'public';

        const result = await core
          .agendas(req.agenda.uid)
          .events.search(query, nav, {
            useAfterKey: true,
            detailed,
            access,
            userUid: req.user?.uid,
            agendaKey: req.agendaKey,
          });

        res.json(buildListEnvelope(result, { limit, detailed }));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /agendas/:agendaUid/events/facets
  // Registered BEFORE the `/events/:eventUid` route so `facets` is not captured
  // as an event uid. Returns counts (`size: 0` — no event hits) grouped by the
  // requested facets over the SAME filtered set as the list.
  app.get(
    '/agendas/:agendaUid/events/facets',
    requireScope('events:read'),
    async (req, res, next) => {
      try {
        const facets = parseFacets(req.query.facets);
        const facetSize = parseFacetSize(req.query.facetSize);
        const facetSizes = parseFacetSizes(req.query.facetSizes);
        const facetSort = parseFacetSort(req.query.facetSort);
        const facetSorts = parseFacetSorts(req.query.facetSorts);
        const facetMissing = parseFacetMissing(req.query.facetMissing);
        const geohashZoom = parseGeohashZoom(req.query.geohashZoom);
        const timingsInterval = parseTimingsInterval(req.query.timingsInterval);

        // additionalFields / additionalFieldMetrics fan out to one aggregation per
        // agenda field. We resolve them AGAINST THE ACCESS-FILTERED SCHEMA up
        // front so only fields the caller may read are ever aggregated (the
        // aggregation itself is not read-access aware). Access is resolved exactly
        // like core's own search (pk → null → treated as the public read level).
        const wantCounts = facets.includes('additionalFields');
        const wantMetrics = facets.includes('additionalFieldMetrics');
        let afSelections = {};
        if (wantCounts || wantMetrics) {
          const access = await loadSearchAccess(core, req.agenda.uid, {
            userUid: req.user?.uid,
            agendaKey: req.agendaKey,
          }) ?? 'public';
          const schema = await core
            .agendas(req.agenda.uid)
            .settings.schema.getMerged({ access });
          afSelections = resolveAdditionalFieldSelections(schema, {
            countsKeys: parseFieldKeys(req.query.additionalFieldsKeys),
            metricsKeys: parseFieldKeys(req.query.additionalFieldMetricsKeys),
            wantCounts,
            wantMetrics,
            access,
          });
        }

        const query = buildEventSearchQuery(req.query);

        // dateRanges buckets a calendar month day-by-day. The `month` window
        // (YYYY-MM, default current month) is read by the aggregation off
        // `query.date`; it also scopes the filtered set to that month. Ignored
        // unless dateRanges is requested.
        if (facets.includes('dateRanges')) {
          const monthWindow = parseMonthWindow(req.query.month);
          if (monthWindow) {
            query.date = monthWindow;
          }
        }

        const result = await core.agendas(req.agenda.uid).events.search(
          query,
          { size: 0 },
          {
            aggregations: buildAggregations(facets, {
              geohashZoom,
              timingsInterval,
              afSelections,
              facetSize,
              facetSizes,
              facetMissing,
            }),
            userUid: req.user?.uid,
            agendaKey: req.agendaKey,
          },
        );

        res.json(
          mapFacets(result.aggregations, facets, {
            afSelections,
            facetSort,
            facetSorts,
          }),
        );
      } catch (err) {
        next(err);
      }
    },
  );

  // POST /agendas/:agendaUid/events/facets
  // Analytical projection of the same facet model: a JSON body of named,
  // repeatable aggregations (the same field may be aggregated several ways
  // under distinct `name` aliases — e.g. `timings` by month AND by year).
  // Filters live under `filters` (the same shape as the list query params).
  // Output is `{ facets: { <alias>: { type, result } } }`. Registered before
  // the `/events/:eventUid` route is irrelevant here (distinct verb), but it
  // shares the facet vocabulary, mappers and access gate with the GET.
  app.post(
    '/agendas/:agendaUid/events/facets',
    requireScope('events:read'),
    async (req, res, next) => {
      try {
        const body = req.body ?? {};
        const facetSize = parseFacetSize(body.facetSize);
        const facetSort = parseFacetSort(body.facetSort);
        const specs = parseFacetSpecs(body.facets, { facetSize, facetSort });

        // Resolve the schema-driven specs against the access-filtered schema
        // (loaded once), so only fields the caller may read are aggregated —
        // the same up-front gate as the GET. Each spec keeps its own selection.
        const afSpecs = specs.filter(
          (s) =>
            s.type === 'additionalFields'
            || s.type === 'additionalFieldMetrics',
        );
        if (afSpecs.length) {
          const access = await loadSearchAccess(core, req.agenda.uid, {
            userUid: req.user?.uid,
            agendaKey: req.agendaKey,
          }) ?? 'public';
          const schema = await core
            .agendas(req.agenda.uid)
            .settings.schema.getMerged({ access });
          for (const spec of afSpecs) {
            const wantCounts = spec.type === 'additionalFields';
            const selections = resolveAdditionalFieldSelections(schema, {
              countsKeys: wantCounts ? spec.fields ?? null : null,
              metricsKeys: wantCounts ? null : spec.fields ?? null,
              wantCounts,
              wantMetrics: !wantCounts,
              access,
            });
            spec.afSelection = wantCounts
              ? selections.additionalFields
              : selections.additionalFieldMetrics;
          }
        }

        const query = buildEventSearchQuery(body.filters ?? {});

        // dateRanges scopes the filtered set to its month (like the GET). With
        // several dateRanges specs the first windowed one wins — they all share
        // the one filtered set.
        const dateSpec = specs.find((s) => s.type === 'dateRanges' && s.month);
        if (dateSpec) {
          query.date = dateSpec.month;
        }

        const result = await core.agendas(req.agenda.uid).events.search(
          query,
          { size: 0 },
          {
            aggregations: buildReportAggregations(specs),
            userUid: req.user?.uid,
            agendaKey: req.agendaKey,
          },
        );

        res.json(mapFacetReport(result.aggregations, specs));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /agendas/:agendaUid/events/schema
  // Registered BEFORE the `/events/:eventUid` route so `schema` is not
  // captured as an event uid. Serves the agenda's merged event form schema (the
  // declarative contract the OA UI builds the event form from): native fields +
  // network/agenda declarations, with per-agenda overrides applied.
  //
  // The descriptors are gated by the caller's read access, exactly like the
  // facets endpoint and the legacy `/:agendaSlug/settings/schema` façade: a
  // restricted field's `read` array is the organiser's declaration that the
  // field (its label, options and role mapping) is internal, so a public
  // (`pk`) caller — resolving to `'public'` — only ever sees `read === null`
  // descriptors. `getMerged` itself does NOT filter (a bare-string `access`
  // no-ops its merge filter), so we apply the gate here through the shared
  // `isReadableAt` predicate.
  app.get(
    '/agendas/:agendaUid/events/schema',
    requireScope('events:read'),
    async (req, res, next) => {
      try {
        const access = await loadSearchAccess(core, req.agenda.uid, {
          userUid: req.user?.uid,
          agendaKey: req.agendaKey,
        }) ?? 'public';

        // The loaded object (not the uid) skips getMergedSchema's agenda
        // re-fetch — req.agenda is rebuilt per request, so the internal
        // `_.isObject` fast path stays request-local.
        const schema = await core
          .agendas(req.agenda)
          .settings.schema.getMerged({ includeEvent: true });

        res.json({
          ...schema,
          fields: (schema.fields ?? []).filter((f) => isReadableAt(f, access)),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /agendas/:agendaUid/events/:eventUid
  app.get(
    '/agendas/:agendaUid/events/:eventUid',
    requireScope('events:read'),
    async (req, res, next) => {
      try {
        const event = await core
          .agendas(req.agenda.uid)
          .events.search.get(
            { uid: req.params.eventUid },
            { detailed: true, userUid: req.user?.uid },
          );

        res.json(mapEvent(event));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /agendas/:agendaUid/locations
  // Cursor-paginated location list (SQL keyset, fixed createdAt.desc order —
  // no `sort` param: the underlying keyset is only correct for that order).
  // `detailed=false` -> LocationSummary, `detailed=true` -> full Location.
  // When the agenda is bound to a shared location set, the whole set is
  // listed (locations contributed by every agenda of the set), like v2.
  app.get(
    '/agendas/:agendaUid/locations',
    requireScope('locations:read'),
    async (req, res, next) => {
      try {
        const limit = resolveLimit(req.query.limit);
        const detailed = resolveDetailed(req.query.detailed);

        const query = buildLocationListQuery(req.query);

        const nav = { limit, useAfter: true, order: 'createdAt.desc' };
        // The locations keyset position is a scalar (the last row's internal
        // id), carried as a 1-element array in the opaque cursor.
        const after = decodeIntCursor(req.query.after);
        if (after != null) {
          nav.after = after;
        }

        const result = await locationEndpoints(core, req.agenda).list(
          query,
          nav,
          {
            total: true,
            includeImagePath: true,
            detailed,
            // The full shape carries `additionalFields` (the legacy tags,
            // filtered against the agenda's merged schema).
            formSchema: detailed
              ? await loadLocationFormSchema(core, req.agenda)
              : null,
          },
        );

        res.json(buildLocationListEnvelope(result, { limit, detailed }));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /agendas/:agendaUid/locations/:locationUid
  // Single location, full `Location` shape. Reads with `deleted: null` so a
  // soft-deleted record surfaces as the service's `{ uid, deleted, mergedIn? }`
  // stub instead of a bare miss: a merged location answers 404 with the
  // machine-readable `merged` code and the surviving uid in
  // `details.mergedIn` (sync clients repair their references with it); any
  // other deleted or unknown uid is a plain 404.
  app.get(
    '/agendas/:agendaUid/locations/:locationUid',
    requireScope('locations:read'),
    async (req, res, next) => {
      try {
        const location = await locationEndpoints(core, req.agenda).get(
          { uid: req.params.locationUid },
          {
            includeImagePath: true,
            deleted: null,
            formSchema: await loadLocationFormSchema(core, req.agenda),
          },
        );

        if (!location || location.deleted) {
          const mergedIn = location?.mergedIn ?? null;
          throw new NotFound(
            {
              info: {
                uid: req.params.locationUid,
                ...mergedIn == null
                  ? {}
                  : { code: 'merged', details: { mergedIn } },
              },
            },
            mergedIn == null
              ? 'location not found'
              : 'location merged into another location',
          );
        }

        res.json(mapLocation(location));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /me/agendas
  // The caller's memberships. Requires a USER identity: a pk key never sets
  // `req.user` (D6.A structural public lock) and an agenda key has none, so
  // both fall through to the 401 — only a secret key, a legacy token or an
  // OAuth token (gated by the `me:read` scope) get through.
  app.get('/me/agendas', requireScope('me:read'), async (req, res, next) => {
    try {
      if (!req.user) {
        throw new NotAuthenticated(
          'a user identity is required: authenticate with a secret key or an OAuth access token',
        );
      }

      const limit = resolveLimit(req.query.limit);
      const detailed = resolveDetailed(req.query.detailed);

      const nav = { size: limit };
      // The memberships keyset position is a scalar (the last row's `order`),
      // carried as a 1-element array in the opaque cursor.
      const after = decodeIntCursor(req.query.after);
      if (after != null) {
        nav.after = after;
      }

      // Passing the loaded user object (not the uid) skips core's redundant
      // user re-fetch.
      const result = await core.users(req.user).agendas.list(nav);

      res.json(await buildMeAgendaList(core, result, { limit, detailed }));
    } catch (err) {
      next(err);
    }
  });

  log('done');

  app.use(sentryErrorHandler({ tag: 'api-v3' }));
  app.use(apiV3ErrorHandler);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'not_found',
        message: 'Unhandled route',
      },
    });
  });

  return app;
}
