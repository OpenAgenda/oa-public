'use strict';

const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');

const log = require('@openagenda/logs')('core/networks/updateSchemaFields');

const patchNetwork = require('./patch');
const getAgendas = require('./getAgendas');

module.exports = core => {
  const {
    services,
    tasks
  } = core;

  tasks.register({
    agendaRebuild: agendaUid => core.agendas(agendaUid).rebuild()
  });

  const {
    formSchemas
  } = services;

  return async (networkUid, updatedFields) => {
    const network = await core.networks(networkUid).get(networkUid);

    if (!network) {
      throw new Error('network not found');
    }

    const networkSchema = network.formSchemaId
      ? await formSchemas.get(network.formSchemaId)
      : null;

    if (network.formSchemaId && !networkSchema) {
      throw new Error('network form schema not found');
    }

    const fs = new FormSchema(networkSchema);

    fs.updateFields(updatedFields);

    if (!networkSchema) {
      log('no schema is associated with network, creating');

      const { id } = await formSchemas.create(fs.getData());

      await patchNetwork(services, network.uid, { formSchemaId: id });
    } else {
      await formSchemas.update(network.formSchemaId, fs.getData());
    }

    const agendas = await getAgendas(services, networkUid);

    log('updating legacy models for %s agendas', agendas.length);

    for (const agenda of agendas) {
      tasks.enqueue('agendaRebuild', agenda.uid, true);
    }
  };
};
