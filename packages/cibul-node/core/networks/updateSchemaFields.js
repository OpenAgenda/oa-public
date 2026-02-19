import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import { BadRequest } from '@openagenda/verror';
import logs from '@openagenda/logs';
import eventReservedFields from '../agendas/settings/eventReservedFields.js';
import patchNetwork from './patch.js';
import getAgendas from './getAgendas.js';

const log = logs('core/networks/updateSchemaFields');

function detectRemovedFields(oldSchema, newSchema) {
  if (!oldSchema || !oldSchema.fields) {
    return [];
  }

  const oldFields = Array.isArray(oldSchema.fields) ? oldSchema.fields : [];
  const newFields = Array.isArray(newSchema.fields) ? newSchema.fields : [];

  const oldFieldKeys = oldFields.map((f) => f.field);
  const newFieldKeys = newFields.map((f) => f.field);

  return oldFieldKeys.filter((key) => !newFieldKeys.includes(key));
}

async function updateChildAgendaSchema(core, { agendaUid, fieldsToRemove }) {
  const { services } = core;
  const { formSchemas } = services;

  log('processing child agenda schema update', {
    agendaUid,
    fieldsToRemove,
  });

  if (fieldsToRemove.length === 0) {
    return;
  }

  const agenda = await core.agendas(agendaUid).get({
    access: 'internal',
  });

  if (!agenda || !agenda.formSchemaId) {
    log('agenda not found or has no formSchemaId', { agendaUid });
    return;
  }

  const agendaSchema = await formSchemas.get(agenda.formSchemaId);

  if (!agendaSchema || !agendaSchema.fields) {
    log('agenda schema not found or has no fields', { agendaUid });
    return;
  }

  const agendaFields = Array.isArray(agendaSchema.fields)
    ? agendaSchema.fields
    : [];

  log('agenda schema fields', {
    agendaUid,
    fieldCount: agendaFields.length,
    fields: agendaFields.map((f) => ({
      field: f.field,
      fieldType: f.fieldType,
    })),
  });

  const fieldsToRemoveFromAgenda = fieldsToRemove.filter((fieldKey) => {
    const field = agendaFields.find((f) => f.field === fieldKey);
    const isAbstract = field && field.fieldType === 'abstract';
    log('checking field', { fieldKey, found: !!field, isAbstract });
    return isAbstract;
  });

  if (fieldsToRemoveFromAgenda.length === 0) {
    log('no abstract placeholders to remove from agenda', {
      agendaUid,
    });
    return;
  }

  log('removing abstract placeholders from child agenda schema', {
    agendaUid,
    fields: fieldsToRemoveFromAgenda,
  });

  const updatedFields = agendaFields.filter(
    (f) => !fieldsToRemoveFromAgenda.includes(f.field),
  );

  await core.agendas(agendaUid).settings.schema.updateFields(updatedFields);
}

export default (core) => {
  const { services, tasks } = core;

  tasks.register({
    agendaRebuild: (agendaUid) => core.agendas(agendaUid).rebuild(),
    networkSchemaUpdateChild: (data) => updateChildAgendaSchema(core, data),
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

    const newSchemaData = fs.getData();

    const removedFields = detectRemovedFields(networkSchema, newSchemaData);

    if (removedFields.length > 0) {
      log('detected removed fields from network schema', {
        fields: removedFields,
      });
    }

    if (!networkSchema) {
      log('no schema is associated with network, creating');

      const { id } = await formSchemas.create(newSchemaData);

      await patchNetwork(services, network.uid, { formSchemaId: id });
    } else {
      await formSchemas.update(network.formSchemaId, newSchemaData);
    }

    const agendas = await getAgendas(services, networkUid, {
      includeFields: ['formSchemaId'],
    });

    if (removedFields.length > 0) {
      log('enqueuing child agenda schema updates', { count: agendas.length });

      for (const agenda of agendas) {
        tasks.enqueue(
          'networkSchemaUpdateChild',
          { agendaUid: agenda.uid, fieldsToRemove: removedFields },
          true,
        );
      }
    } else {
      for (const agenda of agendas) {
        tasks.enqueue('agendaRebuild', agenda.uid, true);
      }
    }

    return newSchemaData;
  };
};
