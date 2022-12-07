'use strict';

const { Forbidden } = require('@openagenda/verror');
const FormSchema = require('@openagenda/form-schemas/iso/FormSchema');
const getMemberSchema = require('../utils/getMemberSchema');
const format = require('./lib/format');
const canRead = require('./lib/canRead');

function validateMemberData(data, schema) {
  let clean = null;
  try {
    const validate = new FormSchema(schema).getValidate();
    clean = validate(data);
  } catch (error) { return false; }
  return !!clean;
}

async function get(core, preloadedOptions, agendaOrUid, identifier, options = {}) {
  const { services } = core;
  const {
    members,
    custom,
  } = services;

  const {
    userUid: actingUserUid,
    access = null,
    isValid = null,
  } = options;

  const agendaUid = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid.uid : agendaOrUid;
  const actingMember = actingUserUid ? await members.get({
    agendaUid,
    userUid: actingUserUid,
  }) : null;

  if (access !== 'internal' && actingMember === null && parseInt(identifier, 10) !== parseInt(actingUserUid, 10)) throw new Forbidden('Not authorized to access member');

  const agenda = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid : await core.agendas(agendaOrUid).get({
    detailed: true,
    access,
    private: null,
  });

  const memberRes = identifier?.constructor.name !== 'Object'
    ? await members.get({
      agendaUid: agenda.uid,
      userUid: identifier,
    }, { ...preloadedOptions, ...options }).then(m => (m ? format(services.members, m, {}) : null))
    : await members.get.byEmail({
      agendaOrUid: agenda.uid,
      ...identifier,
    }, { ...preloadedOptions, ...options }).then(m => (m ? format(services.members, m, {}) : null));

  if (!canRead(services, {
    access,
    actingMember,
    actingUserUid,
    userUid: memberRes?.userUid || identifier,
  })) {
    throw new Forbidden('Not authorized to access member');
  }

  const schemas = await getMemberSchema(services, agenda.uid, { access, actingMember });

  if (!schemas.agendaSchema) {
    return !isValid ? memberRes : { member: memberRes, isValid: validateMemberData(memberRes, schemas.merged) };
  }
  const customRes = await custom(schemas.agendaSchema.id).get(memberRes.userUid);
  const completedMemberData = { ...memberRes, ...customRes };
  return !isValid ? completedMemberData : { member: completedMemberData, isValid: validateMemberData({ ...memberRes, ...customRes }, schemas.merged) };
}

module.exports = Object.assign((services, agendaOrUid, identifier, options) => get(
  services,
  { throwOnNotFound: true },
  agendaOrUid,
  identifier,
  options,
), {
  is: (services, agendaOrUid, identifier, options = {}) => get(
    services,
    { includeFields: ['id'] },
    agendaOrUid,
    identifier,
    options,
  ).then(m => !!m),
});
