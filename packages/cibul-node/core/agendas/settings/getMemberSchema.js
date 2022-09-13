'use strict';

const memberSchema = require('@openagenda/member-apps/dist/components/Form/schema');
const _ = require('lodash');
const getAgenda = require('../utils/getAgenda');

module.exports = async (services, agendaOrUid, options) => {
  const { access } = options;
  const { formSchemas } = services;
  const optionalFields = ['internal', 'administrator', 'moderator'].includes(access);
  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);
  const { memberSchemaId } = agenda;
  if (!memberSchemaId) return memberSchema(optionalFields);
  const customFields = await formSchemas.get(memberSchemaId);
  if (optionalFields) {
    customFields.fields = customFields.fields.map(e => ({ ...e, optional: true }));
  }
  const mergeArgs = [memberSchema(optionalFields), customFields];
  return formSchemas.utils.merge.apply(null, mergeArgs);
};