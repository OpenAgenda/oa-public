'use strict';

const getMergedSchema = require('./settings/getMergedSchema');

module.exports = async (services, agendaUid, options = {}) => {
  const {
    agendas
  } = services;

  const {
    detailed,
    internal
  } = {
    detailed: false,
    internal: false,
    ...options
  };

  const agenda = await agendas.get({ uid: agendaUid }, {
    ...options,
    internal: true
  });

  if (!detailed) {
    return internal ? agenda : agendas.utils.omitInternals(agenda)
  }

  return (internal ? a => a : agendas.utils.omitInternals)({
    ...agenda,
    schema: await getMergedSchema(services, agenda)
  })
}
