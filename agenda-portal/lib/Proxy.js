import _ from 'lodash';
import qs from 'qs';
import { LRUCache } from 'lru-cache';
import logs from './Log.js';
import transformQueryV1ToV2 from './utils/transformQueryV1ToV2.js';

const log = logs('proxy');

const _internalGetAgendaSettings = async (agendaUid, key) => {
  try {
    const response = await fetch(
      `https://api.openagenda.com/v2/agendas/${agendaUid}?key=${key}&detailed=1`,
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    if (err.message === 'Unauthorized') {
      throw err;
    }
    throw err;
  }
};

export default ({
  key,
  defaultLimit,
  preFilter,
  defaultFilter,
  visibilityPastEvents,
  defaultTimezone,
  proxyHookBeforeGet,
  longDescriptionFormat,
  includeFields,
  app,
}) => {
  const appRoot = app.locals.root;
  const getUpcomingEvents = () =>
    app.locals.agenda?.summary?.publishedEvents?.upcoming;
  const ttl = app.locals?.cache?.refreshInterval || 60 * 60 * 1000;
  const max = app.locals?.cache?.maxEntries || 1000;

  log('LRU cache TTL set to %s ms and max entries set to %s', ttl, max);

  const headCache = new LRUCache({ max, ttl });
  const eventsCache = new LRUCache({ max, ttl });

  async function cachedGetAgendaSettings(agendaUid, accessKey) {
    const cacheKey = `head-${agendaUid}-${accessKey}`;

    if (headCache.has(cacheKey)) {
      log('cache hit for head %s', cacheKey);
      return headCache.get(cacheKey);
    }

    log('cache miss for head %s', cacheKey);
    const data = await _internalGetAgendaSettings(agendaUid, accessKey);
    headCache.set(cacheKey, data);
    return data;
  }

  function calculateLimit(queryLimit) {
    const parsedLimit = parseInt(queryLimit, 10);
    return Number.isInteger(parsedLimit) ? parsedLimit : defaultLimit;
  }

  function calculateOffset(query, limit) {
    if (query.offset) {
      return parseInt(query.offset, 10);
    }
    const page = parseInt(query.page || 1, 10);
    return (page - 1) * limit;
  }

  function buildQuery(userQuery) {
    const clientPreFilter = userQuery.pre ? qs.parse(userQuery.pre) : {};

    const query = {
      ...preFilter,
      ...clientPreFilter,
      ..._.omit(userQuery, ['pre', 'nc']),
    };

    // Apply default filter if no specific filters are provided
    const hasNoFilters = !Object.keys(
      _.omit(userQuery, [
        'aggregations',
        'size',
        'page',
        'detailed',
        'nc',
        'includeFields',
      ]),
    ).length;

    if (hasNoFilters && defaultFilter) {
      Object.assign(query, defaultFilter);
    }

    // Handle visibility of past events
    const hasVisibilityPastEvents = visibilityPastEvents === '1' || visibilityPastEvents === 1;
    const upcomingEventsCount = getUpcomingEvents();

    if (
      upcomingEventsCount > 0
      && !userQuery.relative
      && userQuery.timings
      && hasVisibilityPastEvents
    ) {
      query.relative = ['passed', 'current', 'upcoming'];
    }

    return query;
  }

  async function _actualFetch(agendaUid, res, query) {
    log('actual fetch on %s (%s) with query %j', agendaUid, res, query);

    const limit = calculateLimit(query.limit);
    const offset = calculateOffset(query, limit);

    const slugSchemaOptionIdMap = await cachedGetAgendaSettings(
      agendaUid,
      key,
    ).then((a) => a.slugSchemaOptionIdMap);

    const params = {
      ..._.omit(query, ['oaq', 'lang', 'includeFields', 'detailed']),
      ...transformQueryV1ToV2(query.oaq || null, {
        timezone: defaultTimezone,
        slugSchemaOptionIdMap,
        query,
      }),
      key,
      size: limit,
      from: offset,
      cms: 'agenda-portal',
      host: appRoot,
    };

    if (query.includeFields) {
      params.if = [
        ...new Set([
          'slug',
          'uid',
          'firstTiming',
          'lastTiming',
          ...query.includeFields,
        ]),
      ];
    }

    if (!query.includeFields && query.detailed) {
      params.detailed = query.detailed;
    }

    const appliedParams = proxyHookBeforeGet
      ? proxyHookBeforeGet(params)
      : params;

    log('fetching with params', appliedParams);

    const url = new URL(
      `https://api.openagenda.com/v2/agendas/${agendaUid}/${res}`,
    );
    url.search = qs.stringify(appliedParams);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      ...data,
      offset,
      limit,
    };
  }

  async function _cachedFetch(agendaUid, res, userQuery) {
    const query = buildQuery(userQuery);
    const cacheKey = ['events', agendaUid, res, qs.stringify(query)].join('|');

    if (eventsCache.has(cacheKey)) {
      log('cache hit for event %s', cacheKey);
      return eventsCache.get(cacheKey);
    }

    log('cache miss for event %s', cacheKey);
    const result = await _actualFetch(agendaUid, res, query);
    eventsCache.set(cacheKey, result);
    return result;
  }

  function get(agendaUid, { uid, slug }) {
    const query = {
      longDescriptionFormat,
      detailed: 1,
      relative: ['passed', 'upcoming', 'current'],
      ...uid && { uid },
      ...slug && { slug },
    };

    return _cachedFetch(agendaUid, 'events', query).then((r) =>
      r.events.find((e) =>
        (slug ? e.slug === slug : e.uid === parseInt(uid, 10))));
  }

  return {
    head: (agendaUidToQuery) => cachedGetAgendaSettings(agendaUidToQuery, key),
    list: (agendaUidToList, query) =>
      _cachedFetch(agendaUidToList, 'events', {
        ...query,
        includeFields,
        detailed: 1,
      }),
    get,
    defaultLimit,
  };
};
