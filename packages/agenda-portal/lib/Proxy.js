'use strict';

const _ = require('lodash');
const axios = require('axios');
const qs = require('qs');
const parseSearchQuery = require('./utils/searchQuery');
const formatAgendaHead = require('./utils/formatAgendaHead');
const log = require('./Log')('proxy');
const transformQueryV1ToV2 = require('./utils/transformQueryV1ToV2');

const getAgendaSettings = (agendaUid, key) => axios
  .get(
    `https://api.openagenda.com/v2/agendas/${agendaUid}/settings?key=${key}`
  )
  .then(({ data }) => data)
  .catch(err => {
    if (err.response.status === 403) {
      throw new Error('Unauthorized');
    } else {
      throw err;
    }
  });

const cachedHead = _.memoize((key, agendaUid) => axios
  .get(`https://openagenda.com/agendas/${agendaUid}/settings.json`, { key })
  .then(async ({ data }) => formatAgendaHead(agendaUid, await getAgendaSettings(agendaUid, key), data)));

module.exports = ({
  key,
  defaultLimit,
  defaultFilter,
  defaultTimezone,
  jsonExportVersion
}) => {
  async function _fetch(agendaUid, res, query, forcedLimit = null) {
    const oaq = parseSearchQuery(_.get(query, 'oaq'), { defaultFilter });

    const limit = forcedLimit || query.limit || defaultLimit;

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
        ...transformQueryV1ToV2(oaq, {
          timezone: defaultTimezone,
          slugSchemaOptionIdMap: await cachedHead(key, agendaUid).then(
            a => a.slugSchemaOptionIdMap
          )
        }),
        size: limit,
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

  function get(agendaUid, { uid, slug }) {
    return _fetch(
      agendaUid,
      `events.${jsonExportVersion === 2 ? 'v2.' : ''}json`,
      jsonExportVersion === 2
        ? {
          ...(uid ? { uid } : {}),
          ...(slug ? { slug } : {}),
          detailed: 1
        }
        : {
          oaq: {
            passed: 1,
            ...(uid ? { uids: [uid] } : {}),
            ...(slug ? { slug } : {})
          }
        }
    ).then(r => r.events
      .filter(e => {
        if (slug) {
          return e.slug === slug;
        }
        return e.uid === parseInt(uid, 10);
      })
      .pop());
  }

  const cached = _.memoize(_fetch, (agendaUid, res, query) => [agendaUid, res, qs.stringify(query)].join('|'));

  function clearCache() {
    cached.cache.clear();
    cachedHead.cache.clear();

    log('cache is cleared');
  }

  return {
    head: cachedHead.bind(null, key),
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
