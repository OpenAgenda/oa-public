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

async function get(core, preloadedOptions, agendaOrUid, userUid, options = {}) {
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

  if (!canRead(services, {
    access,
    actingMember,
    actingUserUid,
    userUid,
  })) {
    throw new Forbidden('Not authorized to access member');
  }

  const agenda = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid : await core.agendas(agendaOrUid).get({
    detailed: true,
    access,
    private: null,
  });

  const memberRes = await members.get({
    agendaUid: agenda.uid,
    userUid,
  }, { ...preloadedOptions, ...options }).then(m => (m ? format(services.members, m, {}) : null));

  const schemas = await getMemberSchema(services, agenda.uid, { access, actingMember });

  if (!schemas.agendaSchema) {
    return !isValid ? memberRes : { member: memberRes, isValid: validateMemberData(memberRes, schemas.merged) };
  }
  const customRes = await custom(schemas.agendaSchema.id).get(userUid);
  const completedMemberData = { ...memberRes, ...customRes };
  return !isValid ? completedMemberData : { member: completedMemberData, isValid: validateMemberData({ ...memberRes, ...customRes }, schemas.merged) };
}

module.exports = Object.assign((services, agendaOrUid, userUid, options) => get(
  services,
  { throwOnNotFound: true },
  agendaOrUid,
  userUid,
  options,
), {
  is: (services, agendaOrUid, userUid, options = {}) => get(
    services,
    { includeFields: ['id'] },
    agendaOrUid,
    userUid,
    options,
  ).then(m => !!m),
});
