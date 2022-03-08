'use strict';

const log = require('@openagenda/logs')('core/agendas/get');
const {
  NotFound
} = require('@openagenda/verror');
const getMergedSchema = require('./settings/getMergedSchema');
const loadSummary = require('./utils/loadSummary');

function cacheAndReturn(services, options, agendaUid, result) {
  const {
    simpleCache
  } = services;
  const {
    useCache
  } = options;

  if (useCache) {
    simpleCache.hash('core.agendas.get', agendaUid).set(options, result);
  }

  return result;
}

module.exports = async (core, agendaUid, options = {}) => {
  const {
    services
  } = core;

  const {
    agendas,
    simpleCache
  } = services;

  const {
    access = 'public',
    detailed = false,
    includeEvent = false,
    includeAgendaEvent = false,
    includeMember = false,
    throwNotFound = false,
    includeNonDataFields = false,
    useCache = false
  } = options;

  log('getting agenda %s, info with access %s', agendaUid, access);

  if (useCache) {
    const cached = await simpleCache.hash('core.agendas.get', agendaUid).get(options, { json: true });
    if (cached) {
      return cached;
    }
  }

  const agenda = await agendas.get({ uid: agendaUid }, {
    includeImagePath: true,
    ...options,
    detailed: false,
    internal: true
  });

  if (!agenda && throwNotFound) {
    throw new NotFound({ info: { uid: agendaUid } }, 'agenda not found');
  } else if (!agenda) {
    return cacheAndReturn(services, options, agendaUid, null);
  }

  if (!detailed && !includeEvent) {
    return cacheAndReturn(
      services, options, agendaUid,
      access === 'internal' ? agenda : agendas.utils.filterByAccess(agenda, 'read', access)
    );
  }

  log('getting detailed info with access %s', access);
  const related = {};
  try {
    related.summary = await loadSummary(core, agenda, { access });
  } catch (error) {
    log('error', error);
  }

  related.network = detailed && agenda.networkUid ? await services.networks.get(agenda.networkUid) : null;
  related.locationSet = await services.agendaLocations.sets.get(agenda.locationSetUid);

  related.schema = await getMergedSchema(services, agenda, {
    includeNonDataFields,
    includeEvent,
    includeMember,
    includeAgendaEvent,
    access: typeof access === 'string' ? { read: access } : access
  });

  if (access === 'internal') {
    return cacheAndReturn(
      services, options, agendaUid,
      { ...agenda, ...related }
    );
  }

  return cacheAndReturn(
    services, options, agendaUid, {
      ...agendas.utils.filterByAccess(agenda, 'read', access),
      ...related
    }
  );
};
