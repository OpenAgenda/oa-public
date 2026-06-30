// Builds the `{ data, pagination }` list envelope for the v3 locations list.
//
// `detailed=false` items are `LocationSummary`, `detailed=true` items are the
// full `Location` (same shape as the single-get).

import mapLocation, { mapLocationSummary } from './mapLocation.js';
import buildPagination from './pagination.js';
import { pickSelected } from './selectFields.js';

export default function buildLocationListEnvelope(
  result,
  { limit, detailed = false, fields = null },
) {
  const { items = [], total, after = null } = result ?? {};

  const mapItem = detailed ? mapLocation : mapLocationSummary;

  return {
    // `fields` (when set) trims each item to the selected top-level subset.
    data: items.map((item) => pickSelected(mapItem(item), fields)),
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
