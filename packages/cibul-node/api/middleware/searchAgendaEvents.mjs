import logs from '@openagenda/logs';
import boolQuery from '../../lib/boolQuery.js';

const log = logs('api/middleware/searchAgendaEvents');

export default function searchAgendaEvents(core, queryNamespace = 'convertedQuery') {
  return (req, res, next) => core
    .agendas(req.agenda.uid).events
    .search(req[queryNamespace], req[queryNamespace], {
      aggregations: req[queryNamespace].aggs,
      ...req[queryNamespace],
      useAfterKey: true,
      userUid: req.user?.uid,
      includeLocationImagePath: true,
      includeEmbedScripts: boolQuery(req[queryNamespace].includeEmbedScripts, true),
      agendaKey: req.agendaKey,
    }).then(result => {
      const response = JSON.stringify({ ...result, success: true });
      req.result = result;
      req.contentLength = Buffer.byteLength(response, 'utf8');
      res.setHeader('Content-Type', 'application/json');
      res.send(response);
      next();
    }, err => {
      log.error(err);
      next(err);
    });
}
