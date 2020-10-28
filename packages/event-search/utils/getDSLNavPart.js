'use strict';

module.exports = (nav = {}) => {
  if (nav.size === undefined) return null;

  return {
    from: nav.from,
    size: nav.size,
    search_after: nav.searchAfter || undefined
  }
}
