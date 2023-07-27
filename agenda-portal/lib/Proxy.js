'use strict';

const _ = require('lodash');
const axios = require('axios');
const qs = require('qs');
const log = require('./Log')('proxy');
const transformQueryV1ToV2 = require('./utils/transformQueryV1ToV2');

const getAgendaSettings = (agendaUid, key) =>
  axios
    .get(
      `https://api.openagenda.com/v2/agendas/${agendaUid}?key=${key}&detailed=1`,
    )
    .then(({ data }) => data)
    .catch(err => {
      if (err.response.status === 403) {
        throw new Error('Unauthorized');
      } else {
        throw err;
      }
    });

const cachedHead = _.memoize(getAgendaSettings);

module.exports = ({
  key,
  defaultLimit,
  preFilter,
  defaultFilter,
  visibilityPastEvents,
  defaultTimezone,
  proxyHookBeforeGet,
  longDescriptionFormat,
  app,
}) => {
  async function _fetch(agendaUid, res, userQuery) {
    const clientPreFilter = userQuery.pre ? qs.parse(userQuery.pre) : {};

    const query = {
      ...preFilter,
      ...clientPreFilter,
      ..._.omit(userQuery, ['pre']),
    };

    if (
      !Object.keys(
        _.omit(userQuery, ['aggregations', 'size', 'page', 'detailed']),
      ).length
      && defaultFilter
    ) {
      Object.assign(query, defaultFilter);
    }
    const upcomingEvents = app.locals.agenda.summary.publishedEvents.upcoming;

    if (upcomingEvents > 0) {
      if (
        (!userQuery.relative
          && !userQuery.timings
          && visibilityPastEvents === '1')
        || !visibilityPastEvents
      ) {
        const relativeFilter = { relative: ['current', 'upcoming'] };
        Object.assign(query, relativeFilter);
      }
    }

    let limit;

    if (Number.isInteger(parseInt(query.limit, 10))) {
      limit = query.limit;
    } else {
      limit = defaultLimit;
    }

    const offset = parseInt(
      _.get(
        query,
        'offset',
        // if page is given rather than offset, use that.
        (parseInt(_.get(query, 'page', 1), 10) - 1) * limit,
      ),
      10,
    );

    const params = {
      ..._.omit(query, ['oaq', 'lang']),
      ...transformQueryV1ToV2(_.get(query, 'oaq', null), {
        timezone: defaultTimezone,
        slugSchemaOptionIdMap: await cachedHead(agendaUid, key).then(
          a => a.slugSchemaOptionIdMap,
        ),
      }),
      key,
      size: limit,
      from: offset,
      cms: 'agenda-portal',
      host: app.locals.root,
    };

    if (query && query.detailed) {
      params.detailed = query.detailed;
    }

    const appliedParams = proxyHookBeforeGet
      ? proxyHookBeforeGet(params)
      : params;

    log('fetching', appliedParams);

    return axios
      .get(`https://api.openagenda.com/v2/agendas/${agendaUid}/${res}`, {
        params: appliedParams,
        paramsSerializer: qs.stringify,
      })
      .then(({ data }) => ({
        ...data,
        offset,
        limit,
      }));
  }

  function get(agendaUid, { uid, slug }) {
    return _fetch(agendaUid, 'events', {
      longDescriptionFormat,
      ...uid ? { uid } : {},
      ...slug ? { slug } : {},
      detailed: 1,
      relative: ['passed', 'upcoming', 'current'],
    }).then(r =>
      r.events.find(e => {
        if (slug) {
          return e.slug === slug;
        }
        return e.uid === parseInt(uid, 10);
      }));
  }

  const cached = _.memoize(_fetch, (agendaUid, res, query) =>
    [agendaUid, res, qs.stringify(query)].join('|'));

  function clearCache() {
    cached.cache.clear();
    cachedHead.cache.clear();

    log('cache is cleared');
  }

  return {
    head: agendaUid => cachedHead(agendaUid, key),
    list: (agendaUid, query) =>
      cached(agendaUid, 'events', { ...query, detailed: 1 }),
    clearCache,
    get,
    defaultLimit,
  };
};
