import _ from 'lodash';
import { produce } from 'immer';
import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';
import aggregations from './aggregations/index.js';
import defineIncludes from './utils/defineIncludes.js';
import postDSL from './utils/postDSL.js';
import getIndexName from './utils/getIndexName.js';
import getMLTDSLPart from './utils/getMLTDSLPart.js';
import instanciateSearchStream from './utils/instanciateSearchStream.js';
import convertToLocalTimezone from './utils/convertToLocalTimezone.js';
import appendFirstNextAndLastTiming from './utils/appendFirstNextAndLastTiming.js';
import monolingualize from './utils/monolingualize.js';
import includeLabelsInEvent from './utils/includeLabelsInEvent.js';
import includePathInLocationImage from './utils/includePathInLocationImage.js';
import injectDefaultImage from './utils/injectDefaultImage.js';
import filterImageTimestamps from './utils/filterImageTimestamps.js';
import queryToDSL from './utils/queryToDSL.js';
import validateNav from './utils/validateNav.js';
import validateOptions from './utils/validateSearchOptions.js';
import spreadByMLTBoostScores from './utils/spreadByMLTBoostScores.js';
import cleanNavResult from './utils/cleanNavResult.js';
import formatError from './utils/formatError.js';
import cleanRequestedAggregation from './utils/cleanRequestedAggregation.js';
import { inflateAndClean as inflateAndCleanQuery } from './utils/validateQuery.js';
import adminLevelSwap from './utils/adminLevelSwap.js';

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
  useAdminLevels,
}) {
  const parsers = [convertToLocalTimezone];

  const firstNextOrLastRequested = (requestedIncludes ?? []).length
    ? ['firstTiming', 'lastTiming', 'nextTiming'].filter((f) =>
      requestedIncludes.includes(f)).length
    : true;

  if (firstNextOrLastRequested) {
    parsers.push(appendFirstNextAndLastTiming);
  }

  if (!detailed) {
    parsers.push((e) =>
      produce(e, (draft) => {
        ['timings', 'timezone'].forEach((f) => {
          if (!(requestedIncludes || []).includes(f)) {
            delete draft[f];
          }
        });
      }));
  }

  if (monolingual) {
    parsers.push(
      monolingualize.bind(
        null,
        [
          'title',
          'description',
          'keywords',
          'conditions',
          'dateRange',
          'longDescription',
          'country',
          'location.description',
        ],
        monolingual,
      ),
    );
  }

  if (parser) {
    parsers.push(parser);
  }

  if (includeLabels && formSchema) {
    parsers.push(
      includeLabelsInEvent.bind(null, {
        formSchema,
        monolingual,
      }),
    );
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

  parsers.push(
    adminLevelSwap.transformToRequested.bind(null, {
      requestedIncludes,
      useAdminLevels,
    }),
  );

  return parsers;
}

function parseEvents(parsers, events) {
  return events.map((e) =>
    parsers.reduce((transformed, parser) => parser(transformed), e));
}

async function search(config, set, query = {}, nav = {}, options = {}) {
  log('searching', { set, options });
  const start = new Date().getTime();

  let cleanNav = {};
  let cleanDSL;

  const { defaultIndex, emptyValue, assetsPath, defaultImage } = config;

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
    removed,
    useAdminLevels,
    includeSort,
  } = validateOptions(options);

  try {
    cleanNav = validateNav(nav, {
      maxResultWindow: config.dynamicSettings?.max_result_window,
    });
  } catch (e) {
    throw e.name === 'BadRequest' ? e : new BadRequest('nav is not valid');
  }

  const requestedAggregations = shortRequestedAggregations
    ? []
      .concat(shortRequestedAggregations)
      .map(cleanRequestedAggregation.bind(null, { aggsSizeLimit }))
    : undefined;

  const index = getIndexName(set, defaultIndex);
  const includes = defineIncludes(config, {
    detailed,
    formSchema,
    access,
    requested: requestedIncludes,
  });

  if (removed === null || removed === true) {
    includes.push('removed');
  }

  // Only include valid field if detailed or explicitly requested
  if (detailed || (requestedIncludes && requestedIncludes.includes('valid'))) {
    includes.push('valid');
  }

  let cleanQuery;
  try {
    cleanQuery = inflateAndCleanQuery(query, {
      set,
      formSchema,
      emptyValue,
      removed,
    });
  } catch (errors) {
    throw Array.isArray(errors)
      ? new BadRequest({ info: { errors } }, 'query is not valid')
      : errors;
  }

  log('searching with query %j and nav %j', cleanQuery, cleanNav);

  cleanDSL = queryToDSL(
    cleanQuery,
    cleanNav.size !== undefined ? cleanNav : {},
    {
      formSchema,
      includes,
      emptyValue,
      removed,
    },
  );

  if (query.mlt && query.boost) {
    cleanDSL = spreadByMLTBoostScores(cleanDSL, query.mlt, query.boost, {
      formSchema,
    });
  } else if (query.mlt) {
    cleanDSL.query.bool.must = (cleanDSL.query.bool.must || []).concat({
      more_like_this: getMLTDSLPart(query.mlt, {
        formSchema: options.formSchema,
      }),
    });
  }

  // sorting and _source added after
  if (requestedAggregations) {
    cleanDSL.aggregations = aggregations.formatDSL(
      requestedAggregations,
      query,
      { includes, formSchema },
    );
  }

  const { result, error } = await postDSL(
    _.pick(config, ['client']),
    index,
    cleanDSL,
    { includeSort },
  ).then(
    (r) => ({ result: r }),
    (e) => ({ error: e }),
  );

  if (error) {
    throw formatError(error);
  }

  const { events, total, sort } = result;

  let { aggregations: aggregationResults } = result;

  const eventParsers = buildEventParsers(
    {
      detailed,
      monolingual,
      formSchema,
      includeLabels,
      includeImageTimestamps,
      includeLocationImagePath,
      requestedIncludes,
      assetsPath,
      useDefaultImage,
      useAdminLevels,
      defaultImage,
      parser,
    },
    aggregationResults,
  );

  const parsedEvents = parseEvents(eventParsers, events);

  if (requestedAggregations) {
    aggregationResults = aggregations.formatResult(
      requestedAggregations,
      query,
      aggregationResults,
      { formSchema },
    );
  }

  log('response', {
    time: new Date().getTime() - start,
    query,
    nav,
    aggregations: options.aggregations,
    itemsLength: parsedEvents.length,
    total,
  });

  if (first) {
    return parsedEvents.pop();
  }

  return {
    total,
    events: parsedEvents,
    ...cleanNavResult(cleanQuery, { sort }, { useAfterKey, total, events }),
    ...aggregationResults ? { aggregations: aggregationResults } : {},
  };
}

export default (config, set) => {
  const configuredSearch = search.bind(null, config, set);
  return Object.assign(configuredSearch, {
    dsl: (DSL, options) =>
      postDSL(_.pick(config, ['client', 'type']), set, DSL, options),
    stream: instanciateSearchStream.bind(null, configuredSearch, set),
  });
};
