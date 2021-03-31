'use strict';

const _ = require('lodash');
const NotFoundError = require('../../utils/NotFoundError');
const log = require('@openagenda/logs')('core/agendas/events/search');

const loadSearchAccess = require('./lib/loadSearchAccess');
const filterAuthorizedSearchFields = require('./lib/filterAuthorizedSearchFields');

module.exports = async (core, agendaUid, query, nav, options = {}) => {
  const agenda = await core.agendas(agendaUid).get({
    includeEvent: true,
    access: 'internal',
    private: null
  });

  if (!agenda) {
    throw new NotFoundError('agenda', agendaUid);
  }

  const access = await loadSearchAccess(core, agendaUid, options);
  const authorizedQuery = filterAuthorizedSearchFields(core, query, access);

  const {
    returnAgenda = false,
    stream = false,
    apiNav = false,
    userUid = null,
    ...searchOptions
  } = options;

  log('search on %s events with query %s, nav %s and options %s', agendaUid, query, nav, options);

  const search = core.services.eventSearch.agendas(agenda).search;

  const result = stream
    ? search.stream(authorizedQuery, {
      ...searchOptions,
      formSchema: agenda.schema,
      access
    })
    : await search(authorizedQuery, nav, {
      ...searchOptions,
      formSchema: agenda.schema,
      access
    }).then(r => _.omit(r, ['scrollId']));

  return returnAgenda
    ? { agenda, result }
    : result;
}

module.exports.rebuild = async (core, agendaUid) => {
  const agenda = await core.agendas(agendaUid).get({
    detailed: true,
    access: 'internal',
    private: null
  });

  if (!agenda) {
    throw new Error('Not found');
  }

  return core.services.eventSearch.agendas(agenda).rebuild();
}

module.exports.resyncEvent = async (core, agendaUid, eventUid, options = {}) => {
  const {
    throwOnError
  } = {
    throwOnError: true,
    ...options
  }
  try {
    const eventPayload = await core.agendas(agendaUid).events.get(eventUid, {
      internal: true,
      detailed: true,
      returnPayload: true
    });

    if (!eventPayload && throwOnError) {
      throw new NotFoundError('event', eventUid);
    }

    if (!eventPayload) {
      return;
    }

    log('resyncing event %s on index of agenda %s', eventUid, agendaUid);

    const result = await core.services.eventSearch.update(eventPayload);

    return result;
  } catch (err) {
    if (throwOnError) throw err;
    log('error', err);
  }
}
