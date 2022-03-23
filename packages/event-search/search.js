'use strict';

const _ = require('lodash');
const { produce } = require('immer');
const {
  BadRequest
} = require('@openagenda/verror');

const aggregations = require('./aggregations');

const defineIncludes = require('./utils/defineIncludes');
const postDSL = require('./utils/postDSL');
const getIndexName = require('./utils/getIndexName');
const getMLTDSLPart = require('./utils/getMLTDSLPart');
const instanciateSearchStream = require('./utils/instanciateSearchStream');
const convertToLocalTimezone = require('./utils/convertToLocalTimezone');
const appendNextAndLastTiming = require('./utils/appendNextAndLastTiming');
const monolingualize = require('./utils/monolingualize');
const includeLabelsInEvent = require('./utils/includeLabelsInEvent');
const queryToDSL = require('./utils/queryToDSL');
const validateNav = require('./utils/validateNav');
const validateOptions = require('./utils/validateSearchOptions');
const spreadByMLTBoostScores = require('./utils/spreadByMLTBoostScores');
const cleanNavResult = require('./utils/cleanNavResult');

const {
  inflateAndClean: inflateAndCleanQuery
} = require('./utils/validateQuery');

const log = require('@openagenda/logs')('search');

async function search(config, set, query = {}, nav = {}, options = {}) {
  log('searching on set %s', set);
  const start = (new Date()).getTime();

  let cleanNav = {}, cleanDSL;

  const {
    defaultIndex,
    predefinedAggregations,
    emptyValue
  } = config;

  const {
    detailed,
    formSchema,
    aggregations: requestedAggregations,
    monolingual,
    first,
    access,
    includeLabels,
    includeFields: requestedIncludes,
    useAfterKey,
    parser
  } = validateOptions(options);

  try {
    cleanNav = validateNav(nav, { useAfterKey });
  } catch(e) {
    throw new BadRequest('nav is not valid');
  }

  const index = getIndexName(set, defaultIndex);
  const includes = defineIncludes(config, {
    detailed,
    formSchema,
    access,
    requested: requestedIncludes
  });

  const cleanQuery = inflateAndCleanQuery(query, { set, formSchema, emptyValue });

  log('searching with query %j and nav %j', cleanQuery, cleanNav);

  cleanDSL = queryToDSL(
    cleanQuery,
    cleanNav.size !== undefined ? cleanNav : {},
    {
      formSchema,
      includes,
      emptyValue
    }
  );

  if (query.mlt && query.boost) {
    cleanDSL = spreadByMLTBoostScores(cleanDSL, query.mlt, query.boost, { formSchema });
  } else if (query.mlt) {
    cleanDSL.query.bool.must = (cleanDSL.query.bool.must || []).concat({
      more_like_this: getMLTDSLPart(query.mlt, {
        formSchema: options.formSchema
      })
    });
  }

  // sorting and _source added after
  if (requestedAggregations) {
    cleanDSL.aggregations = aggregations.formatDSL(requestedAggregations, query, { includes, formSchema });
  }

  let {
    events,
    total,
    aggregations: aggregationResults,
    sort,
    scrollId
  } = await postDSL(_.pick(config, ['client']), index, cleanDSL, cleanNav.scroll ? cleanNav : {});

  const eventParsers = _buildEventParsers({
    detailed,
    monolingual,
    formSchema,
    includeLabels,
    parser
  }, aggregationResults);

  const parsedEvents = _parseEvents(eventParsers, events);

  if (requestedAggregations) {
    aggregationResults = aggregations.formatResult(requestedAggregations, query, aggregationResults, { formSchema });
  }

  log('info', 'response', { time: (new Date()).getTime() - start, query, nav, aggregations: options.aggregations, itemsLength: parsedEvents.length, total });

  if (first) {
    return parsedEvents.pop();
  }

  return Object.assign({
    total,
    events: parsedEvents,
    ...cleanNavResult(cleanQuery, { scrollId, sort }, { useAfterKey }),
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

function _buildEventParsers({ detailed, monolingual, parser, includeLabels, formSchema }) {
  const parsers = [
    convertToLocalTimezone,
    appendNextAndLastTiming
  ];

  if (!detailed) {
    parsers.push(e => produce(e, draft => {
      delete draft.timings;
      delete draft.timezone;
    }));
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

  if (parser) {
    parsers.push(parser);
  }

  if (includeLabels && formSchema) {
    parsers.push(includeLabelsInEvent.bind(null, {
      formSchema,
      monolingual
    }));
  }

  return parsers;
}
