export default (k, nav, options = {}) => {
  const { after, offset, limit, order } = nav;

  const { stream: streamOptions, search, rankWindow } = options;

  const orderParts = order.split('.');

  // Relevance ranking: when searching, surface the best matches first instead
  // of the raw alphabetical/createdAt order. Skipped for keyset (`useAfter`)
  // pagination, whose cursor relies on a stable placename/id order — relevance
  // order would desync the `after` key from the row sequence.
  const relevanceRanking = !!search && !nav.useAfter && !streamOptions;

  // Bounded candidate window: when relevance ranking applies we fetch an
  // early-terminating window of the most recent matches (`ORDER BY id DESC
  // LIMIT window`) and rank it in JS (see list.js). A whole-agenda `ORDER BY
  // CASE` would defeat the index and filesort every matching row before
  // LIMIT; ranking a bounded window keeps the query agenda-size-independent
  // while still bubbling an exact match onto page 1.
  if (relevanceRanking && rankWindow) {
    k.orderBy('id', 'desc').limit(rankWindow);
    return;
  }

  if (after && orderParts[0] === 'createdAt') {
    k.where('id', orderParts[0] === 'asc' ? '>' : '<', after);
  } else if (after && orderParts[0] === 'name') {
    k.where('placename', orderParts[0] === 'asc' ? '<' : '>', after[0]);
    k.where('id', '>', after[1]);
  }

  if (!streamOptions) {
    if (offset) {
      k.offset(offset);
    }

    k.limit(limit);
  }

  if (orderParts[0] === 'createdAt') {
    k.orderBy('id', orderParts[1]);
  } else if (orderParts[0] === 'name') {
    k.orderBy('placename', orderParts[1]).orderBy('id', 'desc');
  }
};
