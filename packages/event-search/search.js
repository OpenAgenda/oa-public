'use strict';

const _ = require('lodash');
const { produce } = require('immer');
const {
  BadRequest,
} = require('@openagenda/verror');

const logs = require('@openagenda/logs');

const aggregations = require('./aggregations');

const defineIncludes = require('./utils/defineIncludes');
const postDSL = require('./utils/postDSL');
const getIndexName = require('./utils/getIndexName');
const getMLTDSLPart = require('./utils/getMLTDSLPart');
const instanciateSearchStream = require('./utils/instanciateSearchStream');
const convertToLocalTimezone = require('./utils/convertToLocalTimezone');
const appendFirstNextAndLastTiming = require('./utils/appendFirstNextAndLastTiming');
const monolingualize = require('./utils/monolingualize');
const includeLabelsInEvent = require('./utils/includeLabelsInEvent');
const includePathInLocationImage = require('./utils/includePathInLocationImage');
const injectDefaultImage = require('./utils/injectDefaultImage');
const filterImageTimestamps = require('./utils/filterImageTimestamps');
const queryToDSL = require('./utils/queryToDSL');
const validateNav = require('./utils/validateNav');
const validateOptions = require('./utils/validateSearchOptions');
const spreadByMLTBoostScores = require('./utils/spreadByMLTBoostScores');
const cleanNavResult = require('./utils/cleanNavResult');
const formatError = require('./utils/formatError');
const cleanRequestedAggregation = require('./utils/cleanRequestedAggregation');

const {
  inflateAndClean: inflateAndCleanQuery,
} = require('./utils/validateQuery');

const log = logs('search');

function buildEventParsers({
  detailed,
  monolingual,
  parser,
  includeLabels,
  formSchema,
  includeImageTimestamps,
  includeLocationImagePath,
  requestedIncludes,
  assetsPath,
  useDefaultImage,
  defaultImage,
}) {
  const parsers = [
    convertToLocalTimezone,
    appendFirstNextAndLastTiming,
  ];

  if (!detailed) {
    parsers.push(e => produce(e, draft => {
      if (!(requestedIncludes || []).includes('timings')) {
        delete draft.timings;
      }
      if (!(requestedIncludes || []).includes('timezone')) {
        delete draft.timezone;
      }
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
      'location.description',
    ], monolingual));
  }

  if (parser) {
    parsers.push(parser);
  }

  if (includeLabels && formSchema) {
    parsers.push(includeLabelsInEvent.bind(null, {
      formSchema,
      monolingual,
    }));
  }

  if (useDefaultImage) {
    parsers.push(injectDefaultImage.bind(null, { defaultImage }));
  }

  if (!includeImageTimestamps) {
    parsers.push(filterImageTimestamps);
  }

  if (includeLocationImagePath && assetsPath) {
    parsers.push(includePathInLocationImage.bind(null, { assetsPath }));
  }

  return parsers;
}

function parseEvents(parsers, events) {
  return events.map(e => parsers.reduce(
    (transformed, parser) => parser(transformed),
    e,
  ));
}

async function search(config, set, query = {}, nav = {}, options = {}) {
  log('searching on set %s', set);
  const start = new Date().getTime();

  let cleanNav = {};
  let cleanDSL;

  const {
    defaultIndex,
    emptyValue,
    assetsPath,
    defaultImage,
  } = config;

  const {
    detailed,
    formSchema,
    aggregations: shortRequestedAggregations,
    monolingual,
    first,
    access,
    includeLabels,
    includeFields: requestedIncludes,
    useAfterKey,
    parser,
    includeImageTimestamps,
    includeLocationImagePath,
    useDefaultImage,
    aggsSizeLimit,
  } = validateOptions(options);

  try {
    cleanNav = validateNav(nav, {
      maxResultWindow: config.dynamicSettings?.max_result_window,
    });
  } catch (e) {
    throw e.name === 'BadRequest' ? e : new BadRequest('nav is not valid');
  }

  const requestedAggregations = shortRequestedAggregations
    ? [].concat(shortRequestedAggregations).map(cleanRequestedAggregation.bind(null, { aggsSizeLimit }))
    : undefined;

  const index = getIndexName(set, defaultIndex);
  const includes = defineIncludes(config, {
    detailed,
    formSchema,
    access,
    requested: requestedIncludes,
  });

  let cleanQuery;
  try {
    cleanQuery = inflateAndCleanQuery(query, { set, formSchema, emptyValue });
  } catch (errors) {
    console.log('ERROR', errors);
    throw Array.isArray(errors) ? new BadRequest({ info: { errors } }, 'query is not valid') : errors;
  }

  log('searching with query %j and nav %j', cleanQuery, cleanNav);

  cleanDSL = queryToDSL(
    cleanQuery,
    cleanNav.size !== undefined ? cleanNav : {},
    {
      formSchema,
      includes,
      emptyValue,
    },
  );

  if (query.mlt && query.boost) {
    cleanDSL = spreadByMLTBoostScores(cleanDSL, query.mlt, query.boost, { formSchema });
  } else if (query.mlt) {
    cleanDSL.query.bool.must = (cleanDSL.query.bool.must || []).concat({
      more_like_this: getMLTDSLPart(query.mlt, {
        formSchema: options.formSchema,
      }),
    });
  }

  // sorting and _source added after
  if (requestedAggregations) {
    cleanDSL.aggregations = aggregations.formatDSL(requestedAggregations, query, { includes, formSchema });
  }

  const {
    result,
    error,
  } = await postDSL(
    _.pick(config, ['client']),
    index,
    cleanDSL,
    cleanNav.scroll ? cleanNav : {},
  ).then(
    r => ({ result: r }),
    e => ({ error: e }),
  );

  if (error) {
    throw formatError(error);
  }

  const {
    events,
    total,
    sort,
    scrollId,
  } = result;

  let {
    aggregations: aggregationResults,
  } = result;

  const eventParsers = buildEventParsers({
    detailed,
    monolingual,
    formSchema,
    includeLabels,
    includeImageTimestamps,
    includeLocationImagePath,
    requestedIncludes,
    assetsPath,
    useDefaultImage,
    defaultImage,
    parser,
  }, aggregationResults);

  const parsedEvents = parseEvents(eventParsers, events);

  if (requestedAggregations) {
    aggregationResults = aggregations.formatResult(requestedAggregations, query, aggregationResults, { formSchema });
  }

  log('info', 'response', { time: new Date().getTime() - start, query, nav, aggregations: options.aggregations, itemsLength: parsedEvents.length, total });

  if (first) {
    return parsedEvents.pop();
  }

  return {
    total,
    events: parsedEvents,
    ...cleanNavResult(cleanQuery, { scrollId, sort }, { useAfterKey }),
    ...aggregationResults ? { aggregations: aggregationResults } : {},
  };
}

function runScroll(config, set, scrollId, scroll) {
  return config.client
    .scroll({ scrollId, scroll })
    .then(res => ({
      events: res.body.hits.hits.map(h => h._source),
      total: res.body.hits.total.value,
      scrollId: res.body._scroll_id,
    }));
}

module.exports = (config, set) => {
  const methods = {
    search: search.bind(null, config, set),
    scroll: runScroll.bind(null, config, set),
  };

  return Object.assign(methods.search, {
    scroll: methods.scroll,
    dsl: (DSL, options) => postDSL(_.pick(config, ['client', 'type']), set, DSL, options),
    stream: instanciateSearchStream.bind(null, methods, set),
  });
};
