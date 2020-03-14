'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const VError = require('verror');

const aggregations = require('./aggregations');

const defineIncludes = require('./utils/defineIncludes');
const postDSL = require('./utils/postDSL');
const getIndexName = require('./utils/getIndexName');
const instanciateSearchStream = require('./utils/instanciateSearchStream');
const convertToLocalTimezone = require('./utils/convertToLocalTimezone');
const appendNextAndLastTiming = require('./utils/appendNextAndLastTiming');
const monolingualize = require('./utils/monolingualize');
const filterByAccess = require('./utils/filterByAccess');
const queryToDSL = require('./utils/queryToDSL');
const validateNav = require('./utils/validateNav');
const validateOptions = require('./utils/validateSearchOptions');
const spreadByMLTBoostScores = require('./utils/spreadByMLTBoostScores');
const appendMLT = require('./utils/appendMLT');

const textLog = require('./utils/textLog');

const log = require('@openagenda/logs')('search');

async function search(config, set, query = {}, nav = {}, options = {}) {
  log('searching on set %s with query %j', set, query);

  let cleanNav = {}, cleanOptions = {}, cleanDSL;

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
    first,
    access,
    fields,
    additionalFields
  } = validateOptions(options);

  const index = getIndexName(set, defaultIndex);
  const includes = defineIncludes(config, {
    detailed,
    formSchema,
    fields,
    additionalFields
  });

  query.set = set;

  cleanDSL = queryToDSL(
    query,
    cleanNav.size !== undefined ? cleanNav : {},
    formSchema,
    includes
  );

  if (query.mlt && query.boost) {
    cleanDSL = spreadByMLTBoostScores(cleanDSL, query.mlt, query.boost, { formSchema });
  } else if (query.mlt) {
    cleanDSL = appendMLT(cleanDSL, query.mlt, { formSchema })
  }

  // sorting and _source added after

  if (requestedAggregations) {
    cleanDSL.aggregations = aggregations.formatDSL(requestedAggregations, query, { includes, formSchema });
  }

  let {
    events,
    total,
    aggregations: aggregationResults,
    scrollId
  } = await postDSL(_.pick(config, ['client']), index, cleanDSL, cleanNav.scroll ? cleanNav : {});

  const eventParsers = _buildEventParsers({ detailed, monolingual, formSchema, access }, aggregationResults);

  const parsedEvents = _parseEvents(eventParsers, events);

  if (requestedAggregations) {
    aggregationResults = aggregations.formatResult(aggregationResults, { formSchema });
  }

  if (first) {
    return parsedEvents.pop();
  }

  return Object.assign({
    total,
    events: parsedEvents,
    scrollId
  }, aggregationResults ? { aggregations: aggregationResults } : {});
}

function scroll(config, set, scrollId, scroll) {
  return config.client
    .scroll({ scrollId, scroll })
    .then(res => ({
      events: res.body.hits.hits.map( h => h[ '_source' ] ),
      total: res.body.hits.total.value,
      scrollId: res.body._scroll_id
    }));
}

module.exports = (config, set) => {
  const methods = {
    search: search.bind(null, config, set),
    scroll: scroll.bind(null, config, set)
  };

  return Object.assign(methods.search, {
    scroll: methods.scroll,
    dsl: (DSL, options) => postDSL(_.pick(config, ['client', 'type']), set, DSL, options),
    stream: instanciateSearchStream.bind(null, methods, set)
  });
}


function _parseEvents(parsers, events) {
  return events.map(e => {
    parsers.forEach( p => {
      e = p( e );
    } );
    return e;
  });
}

function _buildEventParsers({ detailed, monolingual, formSchema, access }, aggregations) {
  const parsers = [
    convertToLocalTimezone,
    appendNextAndLastTiming
  ];

  if (!detailed) {
    parsers.push(e => ih(e, { $unset: ['timings', 'timezone'] }));
  }

  if (monolingual) {
    parsers.push(monolingualize.bind(null, [
      'title',
      'description',
      'keywords',
      'conditions',
      'dateRange',
      'longDescription',
      'country',
      'location.description'
    ], monolingual));
  }

  if (access && formSchema) {
    parsers.push(e => filterByAccess(formSchema, access, e));
  }

  return parsers;
}
