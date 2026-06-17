// Shared `pagination` block for the v3 list envelopes.
//
// Two keyset families feed it:
// - ES `search_after` lists (events, agendas): `after` is the raw sort-values
//   ARRAY of the last hit, `sort` the sort that produced it.
// - SQL scalar keysets (locations, /me/agendas): `after` is the last row's
//   scalar position, normalized here to the cursor's array form.
//
// Except for core's event search (which emits `after: null` on the last
// page), the backing lists return the last row's position even on the last
// FULL page, so those callers derive `isLastPage` from the short-page
// sentinel (`items.length < limit`) — a full final page costs one extra
// empty request, per the contract ("null when there are no more results").

import { encodeCursor } from './cursor.js';

export default function buildPagination({
  after = null,
  sort = null,
  isLastPage = false,
  limit,
  total,
  totalRelation,
}) {
  return {
    after:
      isLastPage || after == null
        ? null
        : encodeCursor({
          after: Array.isArray(after) ? after : [after],
          sort,
        }),
    limit,
    // `totalRelation` qualifies `total`: `exact` (the default — SQL counts and
    // ES searches that count exhaustively) or `atLeast` when the backing store
    // stops counting past a limit and `total` is only a floor. Emitted with
    // `total`, never without it.
    ...total === undefined
      ? {}
      : { total, totalRelation: totalRelation ?? 'exact' },
  };
}
