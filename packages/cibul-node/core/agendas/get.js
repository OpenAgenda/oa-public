'use strict';

const getMergedSchema = require('./settings/getMergedSchema');
const NotFoundError = require('../utils/NotFoundError');

module.exports = async (services, agendaUid, options = {}) => {
  const {
    agendas
  } = services;

  const {
    detailed,
    internal,
    includeEvent,
    throwNotFound
  } = {
    detailed: false,
    internal: false,
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
    return internal ? agenda : agendas.utils.omitInternals(agenda)
  }

  return (internal ? a => a : agendas.utils.omitInternals)({
    ...agenda,
    schema: await getMergedSchema(services, agenda, { includeEvent })
  })
}
