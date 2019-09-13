'use strict';

const _ = require('lodash');
const axios = require('axios');
const qs = require('qs');
const parseSearchQuery = require('./utils/searchQuery');
const log = require('./Log')('proxy');

module.exports = ({ key, defaultLimit, defaultFilter }) => {
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

    log('fetching', {
      res,
      oaq,
      offset,
      limit
    });

    return axios
      .get(`https://openagenda.com/agendas/${agendaUid}/${res}`, {
        params: {
          key,
          oaq,
          limit,
          offset
        },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'brackets' })
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
    list: (agendaUid, query) => cached(agendaUid, 'events.json', query),
    clearCache,
    get,
    defaultLimit
  };
};
