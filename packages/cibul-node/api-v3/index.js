// OpenAgenda v3 API — read endpoints for agendas and events.
//
// Thin HTTP mapping layer over `core`:
//   GET /agendas                             -> { data: [AgendaSummary|AgendaDetailed], pagination }
//   GET /agendas/:agendaUid                  -> bare Agenda (full)
//   GET /agendas/:agendaUid/events           -> { data: [Event...], pagination }
//   GET /agendas/:agendaUid/events/:eventUid -> bare Event
//
// Auth (createAuthenticate) and agenda loading (createLoadAgenda) are
// v3-native: they throw typed errors into the v3 error envelope. The contract
// is `public/api-spec/openapi.yaml`.

import express from 'express';
import { BadRequest, NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import sentryErrorHandler from '../lib/sentryErrorHandler.js';
import loadSearchAccess from '../core/agendas/events/lib/loadSearchAccess.js';
import createAuthenticate from './lib/authenticate.js';
import requireScope from './lib/requireScope.js';
import createLoadAgenda from './lib/loadAgenda.js';
import mapEvent from './lib/mapEvent.js';
import mapAgenda from './lib/mapAgenda.js';
import buildListEnvelope from './lib/envelope.js';
import buildAgendaListEnvelope from './lib/agendaEnvelope.js';
import buildEventSearchQuery from './lib/buildEventSearchQuery.js';
import buildAgendaSearchQuery from './lib/buildAgendaSearchQuery.js';
import {
  parseFacets,
  parseGeohashZoom,
  parseTimingsInterval,
  parseMonthWindow,
  parseFieldKeys,
  resolveAdditionalFieldSelections,
  buildAggregations,
  mapFacets,
} from './lib/facets.js';
import { decodeCursor } from './lib/cursor.js';
import apiV3ErrorHandler from './errorHandler.js';

const log = logs('api-v3');

// Contract: limit default 20, min 1, max 100.
const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

function resolveLimit(rawLimit) {
  if (rawLimit === undefined) {
    return DEFAULT_LIMIT;
  }
  const value = parseInt(rawLimit, 10);
  if (Number.isNaN(value)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, value));
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

  // Auth resolution (publicKey / agenda-key / access token). Throws typed
  // errors (401 NotAuthenticated / 403 Forbidden) into the v3 error envelope.
  app.get('*', createAuthenticate(core));

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

      // Default to a deterministic sort so the search_after cursor is stable;
      // the cursor carries the sort that produced the previous page and wins.
      const nav = { size: limit, sort: 'createdAt.desc' };
      if (req.query.after !== undefined) {
        const decoded = decodeCursor(req.query.after);
        if (decoded) {
          nav.after = decoded.after;
          if (decoded.sort) nav.sort = decoded.sort;
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
            }),
            userUid: req.user?.uid,
            agendaKey: req.agendaKey,
          },
        );

        res.json(mapFacets(result.aggregations, facets, { afSelections }));
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
