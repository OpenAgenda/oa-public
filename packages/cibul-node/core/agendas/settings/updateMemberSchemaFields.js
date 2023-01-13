'use strict';

const _ = require('lodash');

const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const log = require('@openagenda/logs')('core/agendas/settings/updateMemberFields');

const getAgenda = require('../utils/getAgenda');
const getMemberSchema = require('../utils/getMemberSchema');

module.exports = async function updateSchemaFields(core, agendaOrUid, updatedFields, options = {}) {
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
};
