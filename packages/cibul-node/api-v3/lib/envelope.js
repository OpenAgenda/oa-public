// Builds the `{ data, pagination }` list envelope for the v3 events list.

import mapEvent, { mapEventSummary } from './mapEvent.js';
import buildPagination from './pagination.js';

export default function buildListEnvelope(result, { limit, detailed = false }) {
  const { events = [], total, after = null, sort = null } = result ?? {};

  // `detailed=true` returns full `Event` items (same shape as the single-get),
  // otherwise the lighter `EventSummary`. The contract models `data` as a
  // oneOf of the two; the caller passes the matching `detailed` to `core` so
  // the projection actually carries the detailed field set.
  const mapItem = detailed ? mapEvent : mapEventSummary;

  return {
    data: events.map(mapItem),
    // `core` returns `after: null` on the last page itself — no short-page
    // sentinel needed here.
    pagination: buildPagination({ after, sort, limit, total }),
  };
}
