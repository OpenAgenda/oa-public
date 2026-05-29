import logs from '@openagenda/logs';
import boolQuery from '../../lib/boolQuery.js';
import loadSearchAccess from '../../core/agendas/events/lib/loadSearchAccess.js';

const log = logs('api/middleware/searchAgendaEvents');

export default function searchAgendaEvents(core, options = {}) {
  const {
    queryNamespace = 'convertedQuery',
    sendResponse = true,
    forceIncludeFields,
    stream = false,
  } = options;

  return async (req, res, next) => {
    // A public read path must declare its access level: core's loadSearchAccess
    // returns `null` for an anonymous caller, and `defineIncludes` treats a null
    // access as "trusted caller, no field restriction" (by design). Left null,
    // an anonymous reader gets restricted additional fields projected. Pin it to
    // the resolved level, coercing null → 'public'. Mirrors what core resolves,
    // so member/agenda-key callers are unchanged; only anonymous is tightened.
    let access;
    try {
      access = await loadSearchAccess(core, req.agenda.uid, {
        userUid: req.user?.uid,
        agendaKey: req.agendaKey,
      }) ?? 'public';
    } catch (err) {
      next(err);
      return;
    }

    core
      .agendas(req.agenda.uid)
      .events.search(req[queryNamespace], req[queryNamespace], {
        aggregations: req[queryNamespace].aggs,
        ...req[queryNamespace],
        stream,
        includeFields:
          forceIncludeFields
          ?? req[queryNamespace]?.includeFields
          ?? req[queryNamespace]?.if,
        useAfterKey: true,
        access,
        userUid: req.user?.uid,
        includeLocationImagePath: true,
        includeEmbedScripts: boolQuery(
          req[queryNamespace].includeEmbedScripts,
          { defaultValue: true },
        ),
        agendaKey: req.agendaKey,
        removed: boolQuery(req[queryNamespace].removed, { nullable: true }),
      })
      .then(
        (result) => {
          req.times = result.times;
          if (!sendResponse) {
            req.result = result;
            return next();
          }
          const response = JSON.stringify({ ...result, success: true });
          req.result = result;
          req.contentLength = Buffer.byteLength(response, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.send(response);
          next();
        },
        (err) => {
          if (err.name !== 'BadRequest') {
            log.error(err);
          }
          next(err);
        },
      );
  };
}
