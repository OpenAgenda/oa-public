import _ from 'lodash';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import logs from '@openagenda/logs';
import getAgenda from '../utils/getAgenda.mjs';
import getMemberSchema from '../utils/getMemberSchema.mjs';

const log = logs('core/agendas/settings/updateMemberFields');

export default async function updateSchemaFields(core, agendaOrUid, updatedFields, options = {}) {
  const {
    services,
    tasks,
  } = core;
  const {
    formSchemas,
    agendas,
  } = services;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  const { agendaSchema: agendaMemberSchema } = await getMemberSchema(services, agenda, options);
  const fs = new FormSchema(agendaMemberSchema);

  if (updatedFields) fs.updateFields(updatedFields);

  if (!agendaMemberSchema) {
    log('no schema is associated with agenda, creating');

    const { id } = await formSchemas.create(fs.getData());

    await agendas.set({
      uid: agenda.uid,
    }, { memberSchemaId: id }, {
      protected: false,
    });

    agenda.memberSchemaId = id;
  } else {
    log('schema is associated with agenda, updating');

    await formSchemas.update(agendaMemberSchema.id, fs.getData());
  }

  tasks.enqueue('updateLegacy', agenda, true);

  return true;
}
