'use strict';

const _ = require('lodash');
const getMergedSchema = require('./settings/getMergedSchema');
const NotFoundError = require('../utils/NotFoundError');

const log = require('@openagenda/logs')('core/agendas/get');

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

  log('getting agenda info with access %s', access);

  const agenda = await agendas.get({ uid: agendaUid }, {
    ...options,
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
  
  const schema = await getMergedSchema(services, agenda, {
    includeEvent,
    access: typeof access === 'string' ? { read: access } : access
  });

  if (access === 'internal') {
    return { ...agenda, schema }
  } else {
    return {
      ...agendas.utils.filterByAccess(agenda, 'read', access),
      schema
    }
  }
}
