'use strict';

const _ = require('lodash');

const queryToDSL = require('./queryToDSL');
const validateNav = require('../../validators/nav');
const validateQuery = require('../../validators/query');

module.exports = async ({ alias, client }, query, nav) => {
  const inflatedQuery = validateQuery(Object.keys(query).reduce((inflated, key) => _.set(
    inflated,
    key.split('.'),
    query[key]
  ), {}));

  const cleanNav = validateNav(nav);

  const DSL = queryToDSL(
    inflatedQuery,
    cleanNav
  );
    
  const result = await client.search({
    index: alias,
    body: DSL
  });

  return {
    after: _.last(result.body.hits.hits).sort,
    sort: cleanNav.sort,
    agendas: result.body.hits.hits.map(hit => hit._source),
    total: result.body.hits.total.value
  };
}
