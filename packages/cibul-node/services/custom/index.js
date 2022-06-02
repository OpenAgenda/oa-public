'use strict';

const custom = require('@openagenda/custom');

module.exports.init = (config, services) => {
  const {
    formSchemas
  } = services;

  custom.init({
    logger: config.getLogConfig('svc', 'custom'),
    knex: config.knex,
    schemas: {
      custom: 'custom'
    },
    interfaces: {
      onCreate: () => {},
      onUpdate: () => {},
      onRemove: () => {},
      getValidator: formSchemas.getValidator
    },
    legacy: {
      schemas: {
        event: config.schemas.event,
        agendaEvent: config.schemas.agendaEvent,
        agendaEventTag: config.schemas.agendaEventTag,
        agenda: config.schemas.agenda,
        agendaCategory: config.schemas.agendaCategory,
        agendaTag: config.schemas.agendaTag
      },
      interfaces: {
        getFormSchemaFields: formSchemaId => formSchemas
          .get(formSchemaId)
          .then(fs => (fs ? fs.fields : []))
      }
    }
  });

  return custom;
};
