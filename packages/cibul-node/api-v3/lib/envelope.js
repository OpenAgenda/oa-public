// Builds the `{ data, pagination }` list envelope for the v3 events list.

import mapEvent, { mapEventSummary } from './mapEvent.js';
import buildPagination from './pagination.js';
import { pickSelected } from './selectFields.js';

export default function buildListEnvelope(
  result,
  { limit, detailed = false, fields = null },
) {
  const { events = [], total, after = null, sort = null } = result ?? {};

  // `detailed=true` returns full `Event` items (same shape as the single-get),
  // otherwise the lighter `EventSummary`. The contract models `data` as a
  // oneOf of the two; the caller passes the matching `detailed` to `core` so
  // the projection actually carries the detailed field set.
  const mapItem = detailed ? mapEvent : mapEventSummary;

  return {
    // `fields` (when set) trims each item to the selected top-level subset.
    data: events.map((event) => pickSelected(mapItem(event), fields)),
    // `core` returns `after: null` on the last page itself — no short-page
    // sentinel needed here.
    pagination: buildPagination({ after, sort, limit, total }),
  };
}
