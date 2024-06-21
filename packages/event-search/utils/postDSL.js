'use strict';

const { BadRequest } = require('@openagenda/verror');

const hasFailure = (body, type) => !!(
  body._shards.failures ?? []
).find(({ reason }) => reason.type === type);

module.exports = async function postDSL({ client }, index, DSL, options = {}) {
  const res = await client.search({
    index,
    body: DSL,
    scroll: options.scroll,
  });

  if (hasFailure(res.body, 'too_many_buckets_exception')) {
    throw new BadRequest('Too many aggregations requested');
  }

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
