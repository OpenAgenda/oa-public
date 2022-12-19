'use strict';

const memberSchema = require('@openagenda/members/build/schema');
const _ = require('lodash');
const getAgenda = require('./getAgenda');
const isAdminMod = require('./isAdminMod');

module.exports = async (services, agendaOrUid, options) => {
  const { formSchemas, members } = services;
  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);
  if (agenda.memberSchema?.merged) return agenda.memberSchema;
  const { memberSchemaId } = agenda;
  const isAdmin = await isAdminMod(members, agenda.uid, options);
  const optionalFields = isAdmin || !!memberSchemaId || !agenda.settings.contribution.useFields;

  if (!memberSchemaId) {
    return {
      merged: memberSchema({ optionalFields }),
      schema: memberSchema({ optionalFields }),
      agendaSchema: null,
    };
  }
  const aditionalFields = await formSchemas.get(memberSchemaId);

  if (isAdmin) {
    aditionalFields.fields = aditionalFields.fields.map(e => ({ ...e, optional: true }));
  }
  return {
    merged: formSchemas.utils.merge(memberSchema({ optionalFields }), aditionalFields, { access: { read: options.access } }),
    schema: formSchemas.utils.merge(memberSchema({ optionalFields }), {}, { access: { read: options.access } }),
    agendaSchema: { id: aditionalFields.id, ...formSchemas.utils.merge(aditionalFields, {}, { access: { read: options.access } }) },
  };
};
