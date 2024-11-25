const DEFAULT_LIMIT = 365;

export function get(aggregator) {
  return aggregator.limit === null ? DEFAULT_LIMIT : aggregator.limit;
}

export function exists(limit) {
  return limit !== -1;
}

export function isReached(limit, count) {
  return limit !== -1 && count >= limit;
}
