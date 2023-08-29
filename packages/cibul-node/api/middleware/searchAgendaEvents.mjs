import boolQuery from '../../lib/boolQuery.js';

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
    }).then(result => res.json({
      success: true,
      ...result,
    }), next);
}
