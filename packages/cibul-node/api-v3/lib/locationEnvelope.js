// Builds the `{ data, pagination }` list envelope for the v3 locations list.
//
// `detailed=false` items are `LocationSummary`, `detailed=true` items are the
// full `Location` (same shape as the single-get).

import mapLocation, { mapLocationSummary } from './mapLocation.js';
import buildPagination from './pagination.js';

export default function buildLocationListEnvelope(
  result,
  { limit, detailed = false },
) {
  const { items = [], total, after = null } = result ?? {};

  const mapItem = detailed ? mapLocation : mapLocationSummary;

  return {
    data: items.map(mapItem),
    // SQL keyset, fixed `createdAt.desc` order; the service's `after` is the
    // last row's internal id (a scalar) and is returned even on the last full
    // page — the short-page sentinel is the "no more results" signal (see
    // pagination.js).
    pagination: buildPagination({
      after,
      isLastPage: items.length < limit,
      limit,
      total,
    }),
  };
}
