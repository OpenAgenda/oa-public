import logs from '@openagenda/logs';
import boolQuery from '../../lib/boolQuery.js';

const log = logs('api/middleware/searchAgendaEvents');

export default function searchAgendaEvents(core, options = {}) {
  const {
    queryNamespace = 'convertedQuery',
    sendResponse = true,
    forceIncludeFields,
    stream = false,
  } = options;

  return (req, res, next) =>
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
}
