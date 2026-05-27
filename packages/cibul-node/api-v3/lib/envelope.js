// Builds the `{ data, pagination }` list envelope for the v3 events list.

import { mapEventSummary } from './mapEvent.js';
import { encodeCursor } from './cursor.js';

export default function buildListEnvelope(result, { limit }) {
  const { events = [], total, after = null, sort = null } = result ?? {};

  return {
    data: events.map(mapEventSummary),
    pagination: {
      // `core` returns `after: null` on the last page; otherwise it is the raw
      // search_after array, encoded here into the opaque public cursor.
      after: after == null ? null : encodeCursor({ after, sort }),
      limit,
      ...total === undefined ? {} : { total },
    },
  };
}
