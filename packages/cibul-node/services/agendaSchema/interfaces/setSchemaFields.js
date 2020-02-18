'use strict';

const log = require('@openagenda/logs' )('events/interfaces/setSchema');

module.exports = async (services, agenda, fields) => {
  const {
    core
  } = services;

  return core.agendas(agenda.uid).settings.schema.updateFields(fields);
}
