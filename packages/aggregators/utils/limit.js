'use strict';

const DEFAULT_LIMIT = 365;

module.exports.get = aggregator => (aggregator.limit === null ? DEFAULT_LIMIT : aggregator.limit);

module.exports.exists = limit => limit !== -1;

module.exports.isReached = (limit, count) => limit !== -1 && count >= limit;
