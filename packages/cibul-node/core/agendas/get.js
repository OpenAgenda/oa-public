'use strict';

const _ = require('lodash');
const getMergedSchema = require('./settings/getMergedSchema');
const NotFoundError = require('../utils/NotFoundError');

module.exports = async (services, agendaUid, options = {}) => {
  const {
    agendas
  } = services;

  const {
    access,
    detailed,
    internal,
    includeEvent,
    throwNotFound
  } = {
    access: 'public',
    detailed: false,
    internal: options.access === 'internal',
    includeEvent: false,
    throwNotFound: false,
    ...options
  };

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
    return internal ? agenda : agendas.utils.filterByAccess(agenda, 'read', access);
  }

  const schema = await getMergedSchema(services, agenda, {
    includeEvent,
    access
  });

  if (internal) {
    return { ...agenda, schema }
  } else {
    return {
      ...agendas.utils.filterByAccess(agenda, 'read', access),
      schema
    }
  }
}
