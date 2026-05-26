// OpenAgenda v3 API — read endpoints for events.
//
// Thin HTTP mapping layer over `core`:
//   GET /agendas/:agendaUid/events           -> { data: [Event...], pagination }
//   GET /agendas/:agendaUid/events/:eventUid -> bare Event
//
// Auth/agenda loading reuse the existing v2 middleware (the clean Bearer/scopes
// redesign is a later slice). The contract is `packages/api-spec/openapi.yaml`.

import express from 'express';
import logs from '@openagenda/logs';
import sentryErrorHandler from '../lib/sentryErrorHandler.js';
import * as mw from '../api/middleware/index.js';
import mapEvent from './lib/mapEvent.js';
import buildListEnvelope from './lib/envelope.js';
import buildEventSearchQuery from './lib/buildEventSearchQuery.js';
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

  // Auth resolution (publicKey / agenda-key / access token). Because baseUrl is
  // not `/api`, this enforces authentication.
  app.get('*', mw.verifyAndLoadAgendaOrUserFromKey);

  // Load the agenda for any route exposing :agendaUid.
  app.param('agendaUid', mw.loadAgenda);

  // GET /agendas/:agendaUid/events
  app.get(
    '/agendas/:agendaUid/events',
    mw.evaluateAnonymousAccess,
    async (req, res, next) => {
      try {
        const limit = resolveLimit(req.query.limit);

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

        const result = await core
          .agendas(req.agenda.uid)
          .events.search(query, nav, {
            useAfterKey: true,
            detailed: false,
            userUid: req.user?.uid,
            agendaKey: req.agendaKey,
          });

        res.json(buildListEnvelope(result, { limit }));
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /agendas/:agendaUid/events/:eventUid
  app.get(
    '/agendas/:agendaUid/events/:eventUid',
    mw.evaluateAnonymousAccess,
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
