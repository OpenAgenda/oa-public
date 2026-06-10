import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';
import logger from '@openagenda/logs';

import addListQuery from './lib/addListQuery.js';
import addPaginationAndOrder from './lib/paginationAndOrder.js';
import tokenizeSearch from './lib/tokenizeSearch.js';
import fuzzyFallback from './lib/fuzzyFallback.js';
import { relevanceBucket, deburr } from './lib/scoreLocation.js';
import {
  make as makeAfter,
  include as includeAfterFields,
} from './lib/after.js';
import addSelect from './lib/addSelect.js';
import createStream from './lib/createStream.js';
import validateNav from './lib/validateNav.js';
import validateListOptions from './lib/validateListOptions.js';
import transformAndDecorateItems from './lib/transformAndDecorateItems.js';
import pickContextIdentifiers from './lib/pickAndCleanContextIdentifiers.js';

const log = logger('list');

// Default size of the relevance-ranking candidate window. We rank only this many
// of the most recent matching rows (fetched via an early-terminating
// `ORDER BY id DESC LIMIT window`) instead of filesorting the whole agenda, so
// search stays fast regardless of agenda size. The window is always grown to at
// least `offset + limit` so pagination within it is correct, and is at least as
// large as the fuzzy fallback's candidate request (`nav.limit = 300`).
const RANK_WINDOW = 200;

// Rank a candidate window by per-token relevance (see relevanceBucket),
// tiebreaking on the window's intrinsic `id DESC` recency order. Tokens are
// computed once per search; the input rows are already `id DESC`, so a stable
// sort preserves the recency tiebreak without re-sorting on id.
function rankWindowRows(rows, search) {
  const tokens = tokenizeSearch(search).map(deburr);
  return rows
    .map((row, index) => ({
      row,
      index,
      bucket: relevanceBucket(row.placename, tokens),
    }))
    .sort((a, b) => a.bucket - b.bucket || a.index - b.index)
    .map(({ row }) => row);
}

async function list(
  service,
  query = {},
  nav = {},
  options = {},
  internal = {},
) {
  const inflatedQuery = Object.keys(query || {}).length
    ? Object.keys(query).reduce(
      (inflated, key) => _.set(inflated, key.split('.'), query[key]),
      {},
    )
    : null;
  log('received %j %j %j', inflatedQuery, nav, options);
  const k = service.clients.knex(service.config.schema);
  const cleanListOptions = validateListOptions(options);
  const {
    total: includeTotal,
    endpointId,
    detailed,
    includeFields,
    deleted,
  } = cleanListOptions;

  const cleanNav = validateNav(nav);

  await addListQuery(service, k, deleted, {
    ...inflatedQuery,
    ...pickContextIdentifiers(endpointId, ['agendaUid', 'setUid']),
  });

  let total = includeTotal
    ? await k
      .clone()
      .count('id as total')
      .then((r) => r[0].total)
    : null;

  log('total: %s', total);

  addSelect(k, detailed ? 'public' : 'list', {
    include: includeAfterFields(cleanNav),
    includeFields,
  });

  if ((includeFields ?? []).includes('agendaUid')) {
    k.select('agenda_id');
  }

  const search = typeof inflatedQuery?.search === 'string' ? inflatedQuery.search : null;

  // Relevance ranking applies for a non-keyset, non-streaming search. We then
  // fetch a bounded, early-terminating candidate window and rank it app-side
  // (see rankWindowRows / paginationAndOrder rankWindow branch) rather than
  // letting MySQL filesort every matching row in the agenda.
  const relevanceRanking = !!search && !cleanNav.useAfter && !cleanListOptions.stream;

  const offset = cleanNav.offset ?? 0;
  const rankWindow = relevanceRanking
    ? Math.max(RANK_WINDOW, offset + cleanNav.limit)
    : null;

  if (rankWindow) {
    // The window is ranked and sliced by `placename`/`id`, so both must be
    // present as raw columns even though `id` is internal and `placename` may
    // be excluded by a narrow `includeFields` (transformAndDecorateItems
    // filters the extra columns back out by access).
    k.select('id', 'placename');
  }

  addPaginationAndOrder(k, cleanNav, {
    ...cleanListOptions,
    search,
    rankWindow,
  });

  const result = {};

  if (cleanListOptions.stream) {
    result.stream = createStream(service, k, cleanListOptions);
  } else {
    result.rows = await k;

    if (rankWindow) {
      // Rank the recency-ordered window, then return only the requested page.
      result.rows = rankWindowRows(result.rows, search).slice(
        offset,
        offset + cleanNav.limit,
      );
    }

    result.items = await transformAndDecorateItems(
      service,
      result.rows,
      cleanListOptions,
    );
    log('fetched %s items', result.rows.length);

    // Typo-tolerant fallback: only when an explicit search found nothing and
    // we're not paginating by keyset. Recurses into list() with a single anchor
    // token (guarded by `internal.skipFuzzyFallback`).
    if (
      !internal.skipFuzzyFallback
      && search
      && result.items.length === 0
      && !cleanNav.useAfter
    ) {
      const tokens = tokenizeSearch(search);

      if (tokens.length) {
        const fuzzyItems = await fuzzyFallback(list, service, {
          query,
          nav,
          options,
          tokens,
          limit: cleanNav.limit,
        });

        if (fuzzyItems.length) {
          result.items = fuzzyItems;
          if (total !== null) {
            total = fuzzyItems.length;
          }
        }
      }
    }
  }

  if (total === null && !cleanNav.useAfter) {
    return cleanListOptions.stream ? result.stream : result.items;
  }

  if (total !== null) {
    result.total = total;
  }

  if (cleanNav.useAfter) {
    result.after = makeAfter(result, cleanNav);
  }

  return _.omit(result, ['rows']);
}

list.byAgendaUid = async (
  service,
  agendaUid,
  query = {},
  nav = {},
  options = {},
) => {
  if (!agendaUid) {
    throw new BadRequest('agendaUid is not specified');
  }

  return list(service, query, nav, {
    ...options,
    endpointId: { agendaUid },
  });
};

list.bySetUid = async (service, setUid, query = {}, nav = {}, options = {}) => {
  if (!setUid) {
    throw new BadRequest('set uid is not specified');
  }

  return list(service, query, nav, {
    ...options,
    endpointId: { setUid },
  });
};

export default list;
