// Builds the `{ data, pagination }` list envelope for the v3 agendas list.
//
// `detailed=false` items are `AgendaSummary`, `detailed=true` items are
// `AgendaDetailed` (the search-index detailed projection).

import { mapAgendaSummary, mapAgendaDetailed } from './mapAgenda.js';
import { encodeCursor } from './cursor.js';

export default function buildAgendaListEnvelope(
  result,
  { limit, detailed = false },
) {
  const { agendas = [], total, after = null, sort = null } = result ?? {};

  const mapItem = detailed ? mapAgendaDetailed : mapAgendaSummary;

  // Unlike core's event search (which returns after:null on the last page), the
  // agenda search returns the last hit's search_after even at the end. So we
  // can't trust a null sentinel: a short page (< limit) is the last page →
  // emit after:null per the contract ("null when there are no more results").
  // A full page that happens to be the last costs one extra empty request.
  const isLastPage = agendas.length < limit;

  return {
    data: agendas.map(mapItem),
    pagination: {
      after: isLastPage || after == null ? null : encodeCursor({ after, sort }),
      limit,
      ...total === undefined ? {} : { total },
    },
  };
}
