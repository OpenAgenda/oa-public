'use strict';

const log = require('@openagenda/logs')('events/interfaces/getSchemas');

module.exports = async (services, agenda) => {
  const {
    formSchemas
  } = services;

  log('info', agenda.formSchemaId ? 'agenda schema is loaded' : 'no agenda schema is defined');

  return agenda.formSchemaId ? await formSchemas.get(agenda.formSchemaId) : null;
}
