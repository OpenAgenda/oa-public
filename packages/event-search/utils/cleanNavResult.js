'use strict';

module.exports = (query, { scrollId, sort }, { useAfterKey }) => {
  if (!useAfterKey) {
    return {
      scrollId,
      sort,
    };
  }

  return {
    after: sort,
    scrollId,
    sort: query.sort,
  };
};
