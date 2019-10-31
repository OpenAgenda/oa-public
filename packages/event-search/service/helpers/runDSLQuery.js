'use stric';

const _ = require( 'lodash' );
const config = require( '../config' );

module.exports = async ({ client, type }, alias, DSL, options = {}) => {
  const search = {
    type,
    index: alias,
    body: DSL,
    scroll: options.scroll
  };

  const res = await client.search(search);

  return Object.assign({
    events: res.hits.hits.map(h => h['_source']),
    total: res.hits.total,
    scrollId: res['_scroll_id'],
    searchAfter: DSL.sort && res.hits.hits.length ? res.hits.hits[res.hits.hits.length - 1].sort : null
  }, DSL.aggregations ? {
    aggregations: res.aggregations
  } : {})
}
