import _ from 'lodash';
import { BadRequest } from '@openagenda/verror';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import eventsValidator from '@openagenda/event-form/validators/events';
import logs from '@openagenda/logs';
import getAgenda from '../utils/getAgenda.js';
import eventReservedFields from './eventReservedFields.js';
import getSchema from './getSchema.js';

const log = logs('core/agendas/settings/updateFields');

export default async function updateSchemaFields(
  core,
  agendaOrUid,
  updatedFields,
) {
  log('updating', { updatedFields });
  const { services, tasks } = core;
  const { formSchemas, agendas } = services;

  const agenda = _.isObject(agendaOrUid)
    ? agendaOrUid
    : await getAgenda(services, agendaOrUid);
  const agendaSchema = await getSchema(services, agenda);

  const fs = new FormSchema(
    {
      ...agendaSchema,
      custom: {
        events: eventsValidator,
      },
    },
    { reservedFields: eventReservedFields },
  );

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

  if (!agendaSchema) {
    log('no schema is associated with agenda, creating');

    const { id } = await formSchemas.create(fs.getData());

    await agendas.set(
      {
        uid: agenda.uid,
      },
      { formSchemaId: id },
      {
        private: null,
        protected: false,
      },
    );

    agenda.formSchemaId = id;
  } else {
    log('schema is associated with agenda, updating');
    await formSchemas.update(agendaSchema.id, fs.getData());
  }

  await agendas.resetCache(agenda);

  tasks.enqueue('agendaRebuild', agenda.uid, true);

  return fs.getData();
}
