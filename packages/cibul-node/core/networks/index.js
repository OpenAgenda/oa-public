'use strict';

const getSchema = require('./getSchema');
const UpdateSchemaFields = require('./updateSchemaFields');
const getAgendas = require('./getAgendas');
const addAgenda = require('./addAgenda');
const removeAgenda = require('./removeAgenda');
const get = require('./get');

module.exports = core => {
  const updateSchemaFields = UpdateSchemaFields(core);

  return Object.assign(networkUid => ({
    get: get.bind(null, core, networkUid),
    schema: {
      get: getSchema.bind(null, core, networkUid),
      updateFields: updateSchemaFields.bind(null, networkUid),
    },
    agendas: Object.assign(getAgendas.bind(null, core.services, networkUid), {
      add: addAgenda.bind(null, core, networkUid),
      create: data => core.agendas.create({ ...data, networkUid }, { updateLegacy: true }),
      remove: removeAgenda.bind(null, core, networkUid),
    }),
  }), {
    list: () => core.services.networks.list(),
    create: data => core.services.networks.create(data),
  });
};
