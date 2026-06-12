// Builds the `{ data, pagination }` list envelope for the v3 locations list.
//
// `detailed=false` items are `LocationSummary`, `detailed=true` items are the
// full `Location` (same shape as the single-get).

import mapLocation, { mapLocationSummary } from './mapLocation.js';
import { encodeCursor } from './cursor.js';

export default function buildLocationListEnvelope(
  result,
  { limit, detailed = false },
) {
  const { items = [], total, after = null } = result ?? {};

  const mapItem = detailed ? mapLocation : mapLocationSummary;

  // The locations list is keyset-paginated over SQL with a fixed
  // `createdAt.desc` order; the service's `after` is the last row's internal
  // id (a scalar — normalized to the cursor's array form). Like the agenda
  // search, the service returns a non-null `after` even on the last full
  // page, so a short page (< limit) is the "no more results" signal; a full
  // final page costs one extra empty request.
  const isLastPage = items.length < limit;

  return {
    data: items.map(mapItem),
    pagination: {
      after:
        isLastPage || after == null ? null : encodeCursor({ after: [after] }),
      limit,
      ...total === undefined ? {} : { total },
    },
  };
}
