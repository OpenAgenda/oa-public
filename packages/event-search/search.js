import _ from 'lodash';
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
import getDSLSortPart from './utils/getDSLSortPart.js';
import validateNav from './utils/validateNav.js';
import validateOptions from './utils/validateSearchOptions.js';
import spreadByMLTBoostScores from './utils/spreadByMLTBoostScores.js';
import cleanNavResult from './utils/cleanNavResult.js';
import formatError from './utils/formatError.js';
import cleanRequestedAggregation from './utils/cleanRequestedAggregation.js';
import { inflateAndClean as inflateAndCleanQuery } from './utils/validateQuery.js';
import adminLevelSwap from './utils/adminLevelSwap.js';
import computeRelevanceCutoff from './utils/computeRelevanceCutoff.js';
import probeTopScores from './utils/probeTopScores.js';

const log = logs('search');

// Number of top hits the `threshold=auto` probe inspects to find the relevance
// cliff. Large enough to see the head of the distribution, cheap to fetch.
const RELEVANCE_PROBE_SIZE = 20;

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
    // Drop the full `timings` array from the light projection (the compact view
    // speaks dates through firstTiming/lastTiming/nextTiming). `timezone` is NOT
    // dropped: it is a single IANA name and those compact timings are instants
    // that need it to render correctly across DST — stripping it alongside
    // timings made it useless. An explicit `requestedIncludes` still keeps the
    // full array.
    parsers.push((e) => {
      if ((requestedIncludes || []).includes('timings')) return e;
      const result = { ...e };
      delete result.timings;
      return result;
    });
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

  const {
    defaultIndex,
    emptyValue,
    assetsPath,
    defaultImage,
    relevanceMinDrop,
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

  // Whether the relevance score floor applies: only for a syntactic search with
  // a `threshold` other than `off` (`auto` is dynamic, a number is absolute).
  const thresholdEngaged = !!cleanQuery.search
    && cleanQuery.threshold !== undefined
    && cleanQuery.threshold !== 'off';
  const autoThreshold = thresholdEngaged && cleanQuery.threshold === 'auto';

  // Resolve the sort once: its arity drives the cutoff-cursor check below, and it
  // is handed to queryToDSL so the (nested) sort DSL isn't built a second time.
  const dslSort = getDSLSortPart(cleanQuery);

  // `threshold=auto` over `after`-key pagination carries its computed cutoff as
  // one extra trailing element of the `after` cursor, so pages after the first
  // reuse it instead of re-probing. Strip it back off here, before it would
  // reach ES `search_after` as a spurious extra sort value.
  //
  // Stripped only when the cursor is exactly one element longer than the sort
  // keys — our own appended cursor. A bare sort-length cursor (client-built, or
  // derived from `includeSort` values) is left intact and we re-probe, so a
  // genuine sort value is never mistaken for a cutoff. When set, `relevanceCutoff`
  // IS that cached cutoff — the apply step reuses it without probing.
  let relevanceCutoff;
  if (
    autoThreshold
    && useAfterKey
    && Array.isArray(cleanNav.searchAfter)
    && cleanNav.searchAfter.length === dslSort.length + 1
  ) {
    const cached = Number(
      cleanNav.searchAfter[cleanNav.searchAfter.length - 1],
    );
    if (Number.isFinite(cached)) {
      relevanceCutoff = cached;
      cleanNav.searchAfter = cleanNav.searchAfter.slice(0, -1);
    }
  }

  log('searching with query %j and nav %j', cleanQuery, cleanNav);

  // Reference instant for relative time filters (upcoming/passed/current),
  // floored to the minute. Passing a fixed timestamp instead of ES date-math
  // `now` lets identical requests within the same minute hit ES's query cache;
  // `now` is re-evaluated per request and would make every request a cache miss.
  const now = new Date(Math.floor(start / 60000) * 60000).toISOString();

  cleanDSL = queryToDSL(
    cleanQuery,
    cleanNav.size !== undefined ? cleanNav : {},
    {
      formSchema,
      includes,
      emptyValue,
      removed,
      access,
      sort: dslSort,
      now,
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

  // Relevance score floor (the `threshold` query param). Only meaningful for a
  // syntactic search, where BM25 scores differentiate hits; for filter-only
  // queries scores are uniform and a floor would filter arbitrarily.
  if (thresholdEngaged) {
    let minScore = 0;

    if (typeof cleanQuery.threshold === 'number') {
      // Absolute BM25 floor — applied directly, no probe needed.
      minScore = cleanQuery.threshold;
    } else if (relevanceCutoff !== undefined) {
      // Cutoff carried by the pagination cursor — reuse it, no re-probe.
      minScore = relevanceCutoff;
    } else {
      // First page of `threshold=auto`: probe the top scores of this exact query
      // (same `query` clause, so access-gated fields are mirrored), then find the
      // relevance cliff. This is a SECOND, sequential ES round-trip: the cutoff
      // must be known before the main query is built, so it can't be parallelised
      // or folded into one request. The cost is bounded — only the first page of
      // an after-key session probes; later pages reuse the cursor-cached cutoff.
      // A probe failure degrades to no filtering.
      try {
        const scores = await probeTopScores(
          _.pick(config, ['client']),
          index,
          cleanDSL.query,
          { size: RELEVANCE_PROBE_SIZE },
        );
        relevanceCutoff = computeRelevanceCutoff({
          scores,
          minDrop: relevanceMinDrop,
        });
        minScore = relevanceCutoff;
      } catch (e) {
        relevanceCutoff = 0;
        log.error('relevance probe failed, skipping threshold', e);
      }
    }

    if (minScore > 0) {
      cleanDSL.min_score = minScore;
    }
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

  const navResult = cleanNavResult(
    cleanQuery,
    { sort },
    { useAfterKey, total, events },
  );

  // Carry the dynamic cutoff as the last element of the `after` cursor so the
  // next page reuses it instead of probing again. Appended even when 0 (no
  // cliff) to keep the cursor shape stable and skip re-probing on every page.
  if (autoThreshold && Array.isArray(navResult.after)) {
    navResult.after = [...navResult.after, relevanceCutoff ?? 0];
  }

  return {
    total,
    events: parsedEvents,
    ...navResult,
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
