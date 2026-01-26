import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';
import eventReservedFields from '../agendas/settings/eventReservedFields.js';
import patchNetwork from './patch.js';
import getAgendas from './getAgendas.js';

const log = logs('core/networks/updateSchemaFields');

export default (core) => {
  const { services, tasks } = core;

  tasks.register({
    agendaRebuild: (agendaUid) => core.agendas(agendaUid).rebuild(),
  });

  const { formSchemas } = services;

  return async (networkUid, updatedFields) => {
    log('processing', { networkUid, updatedFields });
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

    const fs = new FormSchema(networkSchema, {
      reservedFields: eventReservedFields,
    });

    try {
      fs.updateFields(updatedFields);
    } catch (e) {
      throw Array.isArray(e)
        ? new BadRequest(
          {
            info: { errors: e },
          },
          'invalid data',
        )
        : e;
    }

    if (!networkSchema) {
      log('no schema is associated with network, creating');

      const { id } = await formSchemas.create(fs.getData());

      await patchNetwork(services, network.uid, { formSchemaId: id });
    } else {
      await formSchemas.update(network.formSchemaId, fs.getData());
    }

    const agendas = await getAgendas(services, networkUid);

    for (const agenda of agendas) {
      tasks.enqueue('agendaRebuild', agenda.uid, true);
    }

    return fs.getData();
  };
};
