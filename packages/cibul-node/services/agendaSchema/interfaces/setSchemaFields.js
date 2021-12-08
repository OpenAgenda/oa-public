'use strict';

module.exports = async (services, agenda, fields) => {
  const {
    core
  } = services;

  return core.agendas(agenda.uid).settings.schema.updateFields(fields);
};
