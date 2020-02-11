'use strict';

const _ = require('lodash');
const textLog = require('./textLog');

module.exports = async ({ client }, index, DSL, options = {}) => {
  const res = await client.search({
    index,
    body: DSL,
    scroll: options.scroll
  });
  //textLog(res);

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
