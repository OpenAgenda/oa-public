'use strict';

module.exports = (
  query,
  { scrollId, sort },
  { useAfterKey, total, events },
) => {
  let cleanSort = Array.isArray(sort) ? sort.map((s) => `${s}`) : sort;

  if (total === events?.length) {
    cleanSort = null;
  }

  if (!useAfterKey) {
    return {
      scrollId,
      sort: cleanSort,
    };
  }

  return {
    after: cleanSort,
    scrollId,
    sort: query.sort,
  };
};
