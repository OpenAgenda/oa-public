'use strict';

const memberSchema = require('@openagenda/members/build/schema');
const { createIntlByLocale } = require('@openagenda/intl');
const locales = require('@openagenda/agenda-schemas-app/dist/locales-compiled');
const log = require('@openagenda/logs')('core/agendas/utils/getMemberSchema');
const _ = require('lodash');
const getAgenda = require('./getAgenda');

const intlByLocale = createIntlByLocale(locales);

const getActingMember = async (services, agenda, options) => {
  if (options.member) return options.member;
  if (options.userUid) {
    return services.members.getMember({ agendaUid: agenda.uid, userUid: options.userUid });
  }
  return null;
};

const getAccess = async (services, actingMember, options) => {
  const { members } = services;
  if (actingMember) {
    return members.utils.getRoleSlug(actingMember.role);
  }
  return options.access ?? 'public';
};

const getAmindMod = access => ['internal', 'administrator', 'moderator'].includes(access);

const isOptionalFields = (agenda, adminMod, memberSchemaId) => {
  if (adminMod) return true;
  if (memberSchemaId) return true;
  if (!agenda.settings.contribution.useFields) return true;
  return false;
};

module.exports = async (services, agendaOrUid, options = {}) => {
  const { formSchemas } = services;
  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);
  const actingMember = await getActingMember(services, agenda, options);
  const access = await getAccess(services, actingMember, options);
  const adminMod = getAmindMod(access);
  const { memberSchemaId } = agenda;
  const optionalFields = isOptionalFields(agenda, adminMod, memberSchemaId);

  log('info', 'fetching for agenda %s isdAmin %s', agenda.uid, adminMod, options);

  if (!memberSchemaId) {
    return {
      merged: memberSchema({ optionalFields }),
      schema: memberSchema({ optionalFields }),
      agendaSchema: null,
    };
  }
  const aditionalFields = await formSchemas.get(memberSchemaId);

  if (adminMod) {
    aditionalFields.fields = aditionalFields.fields.map(e => ({ ...e, optional: true }));
  }

  return {
    merged: formSchemas.utils.merge(memberSchema({ optionalFields }), aditionalFields, { access: { read: access } }),
    schema: formSchemas.utils.merge(memberSchema({ optionalFields }), {}, { access: { read: access } }),
    agendaSchema: { id: aditionalFields.id, ...formSchemas.utils.merge(aditionalFields, {}, { access: { read: access } }) },
  };
};

module.exports.andParents = async function getMemberSchemaAndParents(services, agendaOrUid, options) { // affichage pour la config, only admins
  const { formSchemas } = services;
  const { lang = 'fr' } = options;
  const intl = intlByLocale[lang] || intlByLocale.fr;
  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(services, agendaOrUid);
  const { memberSchemaId } = agenda;

  const parents = [{
    schema: { ...memberSchema({ optionalFields: !!memberSchemaId }), id: -1 },
    info: {
      label: intl.formatMessage({ id: 'AgendaSchema.member' }),
      detail: intl.formatMessage({ id: 'AgendaSchema.memberDetail' }),
    },
  }];

  if (!memberSchemaId) {
    return {
      schema: null,
      parents,
    };
  }
  const aditionalFields = await formSchemas.get(memberSchemaId);

  return {
    schema: {
      id: memberSchemaId,
      ...aditionalFields,
    },
    parents,
  };
};
