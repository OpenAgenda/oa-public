'use strict';

const get = require('./get');
const list = require('./list');
const getSchema = require('./getSchema');
const UpdateSchemaFields = require('./updateSchemaFields');
const getAgendas = require('./getAgendas');
const addAgenda = require('./addAgenda');
const createAgenda = require('./createAgenda');

module.exports = core => {
  const updateSchemaFields = UpdateSchemaFields(core);

  return Object.assign(networkUid => ({
    get: get.bind(null, core.services, networkUid),
    schema: {
      get: getSchema.bind(null, networkUid),
      updateFields: updateSchemaFields.bind(null, networkUid),
    },
    agendas: Object.assign(getAgendas.bind(null, networkUid), {
      add: addAgenda.bind(null, core, networkUid),
      create: createAgenda.bind(null, core, networkUid)
    })
  }), {
    list,
    create: data => core.services.networks.create(data)
  });
}
