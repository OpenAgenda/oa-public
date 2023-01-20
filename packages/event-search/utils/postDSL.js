'use strict';

module.exports = async function postDSL({ client }, index, DSL, options = {}) {
  const res = await client.search({
    index,
    body: DSL,
    scroll: options.scroll,
  });

  return {
    events: res.body.hits.hits.map(h => h._source),
    total: res.body.hits.total.value,
    scrollId: res.body._scroll_id,
    sort: DSL.sort && res.body.hits.hits.length ? res.body.hits.hits[res.body.hits.hits.length - 1].sort : null,
    ...DSL.aggregations ? {
      aggregations: res.body.aggregations,
    } : {},
  };
};
