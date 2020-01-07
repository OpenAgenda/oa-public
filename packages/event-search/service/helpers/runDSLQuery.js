'use strict';

const _ = require('lodash');
const textLog = require('./textLog');

module.exports = async ({ client }, alias, DSL, options = {}) => {
  const search = {
    index: alias,
    body: DSL,
    scroll: options.scroll
  };

  const res = await client.search(search);

  return {
    events: res.body.hits.hits.map(h => h['_source']),
    total: res.body.hits.total.value,
    scrollId: res.body['_scroll_id'],
    searchAfter: DSL.sort && res.body.hits.hits.length ? res.body.hits.hits[res.body.hits.hits.length - 1].sort : null,
    ...(DSL.aggregations ? {
      aggregations: res.body.aggregations
    } : {})
  };
}
