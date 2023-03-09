'use strict';

const log = require('@openagenda/logs')('morelikeThis');

module.exports = (search, MLTQuery, MLTOptions, query) => {
  log('compiling more like this query from %j MLT query, %j MLT options and %j query', MLTQuery, MLTOptions || 'no', query || 'no');

  if (Object.keys(MLTQuery).length === 0) {
    return {
      events: [],
      total: 0,
    };
  }

  return search({
    ...query || { sort: 'score' },
    mlt: MLTQuery,
    boost: MLTOptions ? MLTOptions.boost : null,
  }, MLTOptions, MLTOptions);
};
