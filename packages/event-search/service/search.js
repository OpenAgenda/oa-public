'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const VError = require('verror');

const buildAggregationDSL = require('./aggregation');
const runDSLQuery = require('./helpers/runDSLQuery');
const getIndexName = require('./helpers/getIndexName');
const instanciateSearchStream = require('./helpers/instanciateSearchStream');
const convertToLocalTimezone = require('../utils/convertToLocalTimezone');
const appendNextAndLastTiming = require('../utils/appendNextAndLastTiming');
const monolingualize = require('../utils/monolingualize');
const parseAggregationResult = require('./aggregation').parseResult;
const queryToDSL = require('../utils/queryToDSL');
const validateNav = require('./query/validateNav');
const validateOptions = require('../utils/validateSearchOptions');
const getFormSchemaAdditionalFields = require('../utils/getFormSchemaAdditionalFields');

const log = require('@openagenda/logs')('search');

async function search(config, set, query = {}, nav = {}, options = {}) {
  log('searching on set %s with query %j', set, query);

  let cleanNav = {}, cleanOptions = {}, cleanDsl;

  const {
    defaultIndex,
    predefinedAggregations
  } = config;

  try {
    cleanNav = validateNav(nav);
  } catch(e) {
    throw new VError(e, 'nav is not valid');
  }

  const {
    detailed,
    formSchema,
    aggregations: requestedAggregations,
    monolingual,
    first
  } = validateOptions(options);

  const index = getIndexName(set, defaultIndex);

  query.set = set;

  cleanDsl = queryToDSL(
    query,
    cleanNav.size !== undefined ? cleanNav : {},
    formSchema,
    // includes
    _defineIncludes(config, { detailed, formSchema })
  );

  // sorting and _source added after

  if (requestedAggregations) {
    cleanDsl.aggregations = buildAggregationDSL(config, requestedAggregations, predefinedAggregations, query);
  }

  let {
    events,
    total,
    aggregations,
    scrollId
  } = await runDSLQuery(_.pick(config, ['client']), index, cleanDsl, cleanNav.scroll ? cleanNav : {});

  const eventParsers = _buildEventParsers({ detailed, monolingual }, aggregations);

  const parsedEvents = _parseEvents(eventParsers, events);

  if (options.aggregations) {
    aggregations = parseAggregationResult(config, options.aggregations, aggregations, config.predefinedAggregations, _parseEvents.bind( null, eventParsers ) );
  }

  if (first) {
    return parsedEvents.pop();
  }

  return Object.assign({
    total,
    events: parsedEvents,
    scrollId
  }, aggregations ? { aggregations } : {});
}

function scroll(config, set, scrollId, scroll) {
  return config.client
    .scroll({ scrollId, scroll })
    .then(res => ({
      events: res.body.hits.hits.map( h => h[ '_source' ] ),
      total: res.body.hits.total.value
    }));
}

module.exports = (config, set) => {
  const methods = {
    search: search.bind(null, config, set),
    scroll: scroll.bind(null, config, set)
  };

  return Object.assign(methods.search, {
    scroll: methods.scroll,
    dsl: (DSL, options) => runDSLQuery(_.pick(config, ['client', 'type']), set, DSL, options),
    stream: instanciateSearchStream.bind(null, methods, set)
  });
}


function _parseEvents( parsers, events ) {
  return events.map(e => {
    parsers.forEach( p => {
      e = p( e );
    } );
    return e;
  });
}

function _defineIncludes({ baseSearchIncludes, detailedSearchIncludes }, { detailed, formSchema }) {
  const includes = [].concat(detailed ? detailedSearchIncludes : baseSearchIncludes);

  return formSchema ? includes.concat(
    getFormSchemaAdditionalFields(formSchema).map(f => f.field)
  ) : includes;
}

function _buildEventParsers({ detailed, monolingual }, aggregations) {
  return [
    convertToLocalTimezone,
    appendNextAndLastTiming
  ].concat(
    detailed ? [] : e => ih(e, { $unset: ['timings', 'timezone'] })
  ).concat(
    monolingual ? monolingualize.bind(null, [
      'title',
      'description',
      'keywords',
      'conditions',
      'dateRange',
      'longDescription',
      'country',
      'location.description'
    ], monolingual) : []);

}
