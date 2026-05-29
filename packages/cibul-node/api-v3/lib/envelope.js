// Builds the `{ data, pagination }` list envelope for the v3 events list.

import mapEvent, { mapEventSummary } from './mapEvent.js';
import { encodeCursor } from './cursor.js';

export default function buildListEnvelope(result, { limit, detailed = false }) {
  const { events = [], total, after = null, sort = null } = result ?? {};

  // `detailed=true` returns full `Event` items (same shape as the single-get),
  // otherwise the lighter `EventSummary`. The contract models `data` as a
  // oneOf of the two; the caller passes the matching `detailed` to `core` so
  // the projection actually carries the detailed field set.
  const mapItem = detailed ? mapEvent : mapEventSummary;

  return {
    data: events.map(mapItem),
    pagination: {
      // `core` returns `after: null` on the last page; otherwise it is the raw
      // search_after array, encoded here into the opaque public cursor.
      after: after == null ? null : encodeCursor({ after, sort }),
      limit,
      ...total === undefined ? {} : { total },
    },
  };
}
