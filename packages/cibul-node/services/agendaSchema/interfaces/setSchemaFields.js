'use strict';

module.exports = async (services, agendaUid, fields) => {
  const {
    core
  } = services;

  return core.agendas(agendaUid).settings.schema.updateFields(fields);
};
