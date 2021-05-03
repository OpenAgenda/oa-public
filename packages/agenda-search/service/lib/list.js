'use strict';

const _ = require('lodash');

const queryToDSL = require('./queryToDSL');
const validateNav = require('../../validators/nav');
const validateQuery = require('../../validators/query');
const validateOptions = require('../../validators/options');

module.exports = async ({ alias, client, cleanIndexedAgenda }, query, nav, options) => {
  const inflatedQuery = Object.keys(query || {}).length ? validateQuery(Object.keys(query).reduce((inflated, key) => _.set(
    inflated,
    key.split('.'),
    query[key]
  ), {})) : null;

  const cleanNav = validateNav(nav);

  const DSL = queryToDSL(
    inflatedQuery,
    cleanNav,
    validateOptions(options)
  );
    
  const result = await client.search({
    index: alias,
    body: DSL
  });

  return {
    after: _.last(result.body.hits.hits)?.sort,
    sort: cleanNav.sort,
    agendas: result.body.hits.hits
      .map(hit => hit._source)
      .map(agenda => cleanIndexedAgenda(agenda, options)),
    total: result.body.hits.total.value
  };
}
