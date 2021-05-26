'use strict';

const log = require('@openagenda/logs')('core/agendas/get');
const NotFoundError = require('../utils/NotFoundError');
const getMergedSchema = require('./settings/getMergedSchema');
const loadSummary = require('./utils/loadSummary');

module.exports = async (core, agendaUid, options = {}) => {
  const {
    services
  } = core;

  const {
    agendas
  } = services;

  const {
    access = 'public',
    detailed = false,
    includeEvent = false,
    throwNotFound = false
  } = options;

  log('getting agenda %s, info with access %s', agendaUid, access);

  const agenda = await agendas.get({ uid: agendaUid }, {
    includeImagePath: true,
    ...options,
    detailed: false,
    internal: true
  });

  if (!agenda && throwNotFound) {
    throw new NotFoundError('agendas', agendaUid);
  } else if (!agenda) {
    return null;
  }

  if (!detailed && !includeEvent) {
    return access === 'internal' ? agenda : agendas.utils.filterByAccess(agenda, 'read', access);
  }

  log('getting detailed info with access %s', access);

  const summary = await loadSummary(core, agenda, { access });

  const network = detailed && agenda.networkUid ? await services.networks.get(agenda.networkUid) : null;
  const locationSet = await services.agendaLocations.sets.get(agenda.locationSetUid);

  const schema = await getMergedSchema(services, agenda, {
    includeEvent,
    access: typeof access === 'string' ? { read: access } : access
  });

  if (access === 'internal') {
    return { ...agenda, schema, summary, network };
  }

  return {
    ...agendas.utils.filterByAccess(agenda, 'read', access),
    network,
    locationSet,
    schema,
    summary
  };
};
