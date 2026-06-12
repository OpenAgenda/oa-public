// Builds the `{ data, pagination }` list envelope for the v3 agendas list.
//
// `detailed=false` items are `AgendaSummary`, `detailed=true` items are
// `AgendaDetailed` (the search-index detailed projection).

import { mapAgendaSummary, mapAgendaDetailed } from './mapAgenda.js';
import buildPagination from './pagination.js';

export default function buildAgendaListEnvelope(
  result,
  { limit, detailed = false },
) {
  const { agendas = [], total, after = null, sort = null } = result ?? {};

  const mapItem = detailed ? mapAgendaDetailed : mapAgendaSummary;

  return {
    data: agendas.map(mapItem),
    // Unlike core's event search, the agenda search returns the last hit's
    // search_after even at the end — the short-page sentinel is the "no more
    // results" signal (see pagination.js).
    pagination: buildPagination({
      after,
      sort,
      isLastPage: agendas.length < limit,
      limit,
      total,
    }),
  };
}
