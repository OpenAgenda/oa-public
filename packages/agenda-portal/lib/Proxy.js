'use strict';

const _ = require('lodash');
const axios = require('axios');
const qs = require('qs');
const parseSearchQuery = require('./utils/searchQuery');
const log = require('./Log')('proxy');
const transformQueryV1ToV2 = require('./utils/transformQueryV1ToV2');

module.exports = ({
  key,
  defaultLimit,
  defaultFilter,
  defaultTimezone,
  jsonExportVersion
}) => {
  function _fetch(agendaUid, res, query, forcedLimit = null) {
    const oaq = parseSearchQuery(_.get(query, 'oaq'), { defaultFilter });

    const limit = forcedLimit || defaultLimit;

    const offset = parseInt(
      _.get(
        query,
        'offset',
        // if page is given rather than offset, use that.
        (parseInt(_.get(query, 'page', 1), 10) - 1) * limit
      ),
      10
    );

    const params = jsonExportVersion === 2
      ? {
        ..._.omit(query, ['oaq']),
        ...transformQueryV1ToV2(oaq, { timezone: defaultTimezone }),
        limit,
        offset
      }
      : {
        key,
        oaq,
        limit,
        offset
      };

    log('fetching', params);

    if (query && query.detailed) {
      params.detailed = query.detailed;
    }

    return axios
      .get(`https://openagenda.com/agendas/${agendaUid}/${res}`, {
        params,
        paramsSerializer: unserialized => qs.stringify(unserialized, { arrayFormat: 'brackets' })
      })
      .then(({ data }) => data);
  }

  const cached = _.memoize(_fetch, (agendaUid, res, query) => [agendaUid, res, qs.stringify(query)].join('|'));

  function clearCache() {
    cached.cache.clear();

    log('cache is cleared');
  }

  function get(agendaUid, { uid, slug }) {
    return _fetch(
      agendaUid,
      'events.json',
      {
        oaq: {
          passed: 1,
          ...(uid ? { uids: [uid] } : {}),
          ...(slug ? { slug } : {})
        }
      },
      1
    ).then(r => _.get(r, 'events.0'));
  }

  return {
    head: agendaUid => cached(agendaUid, 'settings.json').then(result => _.set(result, 'uid', agendaUid)),
    list: (agendaUid, query) => {
      if (jsonExportVersion === 2) {
        query.detailed = 1;
      }
      return cached(
        agendaUid,
        `events.${jsonExportVersion === 2 ? 'v2.' : ''}json`,
        query
      );
    },
    clearCache,
    get,
    defaultLimit
  };
};
