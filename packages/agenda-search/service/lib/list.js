'use strict';

const queryToDSL = require('./queryToDSL');

module.exports = async ({ alias, client }, query, offset, limit) => {
  const DSL = queryToDSL(query, offset, limit);

  const result = await client.search({
    index: alias,
    body: DSL
  });

  return {
    items: result.body.hits.hits.map(hit => hit._source),
    total: result.body.hits.total.value
  };
}
