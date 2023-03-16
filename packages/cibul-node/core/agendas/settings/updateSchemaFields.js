'use strict';

const _ = require('lodash');

const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const log = require('@openagenda/logs')('core/agendas/settings/updateFields');

const getAgenda = require('../utils/getAgenda');
const getSchema = require('./getSchema');

module.exports = async function updateSchemaFields(core, agendaOrUid, updatedFields) {
  const {
    services,
    tasks,
  } = core;
  const {
    formSchemas,
    agendas,
  } = services;

  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);

  const agendaSchema = await getSchema(services, agenda);

  const fs = new FormSchema(agendaSchema);

  fs.updateFields(updatedFields);

  if (!agendaSchema) {
    log('no schema is associated with agenda, creating');

    const { id } = await formSchemas.create(fs.getData());

    await agendas.set({
      uid: agenda.uid,
    }, { formSchemaId: id }, {
      protected: false,
    });

    agenda.formSchemaId = id;
  } else {
    log('schema is associated with agenda, updating');

    await formSchemas.update(agendaSchema.id, fs.getData());
  }

  await agendas.resetCache(agenda);

  tasks.enqueue('updateLegacy', agenda, true);

  return true;
};
