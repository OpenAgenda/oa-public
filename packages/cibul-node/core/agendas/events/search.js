'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/events/search');
const { NotFound } = require('@openagenda/verror');
const convertLongDescription = require('./lib/convertLongDescription');
const convertToDateHoursMinutesTimings = require('./lib/convertToDateHoursMinutesFormat');
const loadSearchAccess = require('./lib/loadSearchAccess');
const filterAuthorizedSearchFields = require('./lib/filterAuthorizedSearchFields');

module.exports = async (core, agendaUid, query, nav, options = {}) => {
  const agenda = await core.agendas(agendaUid).get({
    includeEvent: true,
    includeMember: true,
    includeAgendaEvent: true,
    access: 'internal',
    private: null,
    useCache: true
  });

  if (!agenda) {
    throw new NotFound({
      info: { uid: agendaUid }
    }, 'agenda not found');
  }

  const access = await loadSearchAccess(core, agendaUid, options);

  const authorizedQuery = filterAuthorizedSearchFields(core, query, access);

  const {
    returnAgenda = false,
    stream = false,
    useAfterKey = false,
    longDescriptionFormat = null,
    useDateHoursMinutesFormat = false,
    ...searchOptions
  } = options;

  const parsers = [];

  log('search on %s events with query %s, nav %s and options %s', agendaUid, authorizedQuery, nav, options);

  if (longDescriptionFormat && convertLongDescription.conversions.includes(longDescriptionFormat)) {
    parsers.push(convertLongDescription.load({
      services: core.services,
      conversion: longDescriptionFormat
    }));
  }

  if (useDateHoursMinutesFormat) {
    parsers.push(convertToDateHoursMinutesTimings(core.services.events));
  }

  const { search } = core.services.eventSearch.agendas(agenda);

  if (parsers.length) {
    searchOptions.parser = e => parsers.reduce((event, parser) => parser(event), e);
  }

  const result = stream
    ? search.stream(authorizedQuery, {
      ...searchOptions,
      access
    })
    : await search(authorizedQuery, nav, {
      ...searchOptions,
      useAfterKey,
      access
    }).then(r => _.omit(r, ['scrollId']));

  return returnAgenda
    ? { agenda, result }
    : result;
};

module.exports.rebuild = async (core, agendaUid) => {
  const agenda = await core.agendas(agendaUid).get({
    detailed: true,
    access: 'internal',
    private: null
  });

  if (!agenda) {
    throw new NotFound({
      message: 'agenda not found',
      info: { uid: agendaUid }
    });
  }

  return core.services.eventSearch.agendas(agenda).rebuild();
};

module.exports.resyncEvent = async function resyncEvent(core, agendaUid, eventUid, options = {}) {
  const {
    throwOnError
  } = {
    throwOnError: true,
    ...options
  };

  try {
    const eventPayload = await core.agendas(agendaUid).events.get(eventUid, {
      access: 'internal',
      detailed: true,
      returnPayload: true
    });

    if (!eventPayload && throwOnError) {
      throw new NotFound({
        message: 'event not found',
        info: { uid: eventUid }
      });
    }

    if (!eventPayload) {
      return;
    }

    log('resyncing event %s on index of agenda %s', eventUid, agendaUid);

    const result = await core.services.eventSearch.update(eventPayload, {
      updateOtherIndices: false
    });

    return result;
  } catch (err) {
    if (throwOnError) throw err;
    log('error', err);
  }
};
