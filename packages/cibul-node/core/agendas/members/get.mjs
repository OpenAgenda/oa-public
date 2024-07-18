import { Forbidden, NotFound } from '@openagenda/verror';
import FormSchema from '@openagenda/form-schemas/iso/FormSchema.js';
import getMemberSchema from '../utils/getMemberSchema.mjs';
import format from './lib/format.mjs';
import canRead from './lib/canRead.mjs';

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
    returnIsValid = false,
    roleAsSlug = true,
    detailed = false,
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

  if (!agenda) {
    throw new NotFound({ info: { uid: agendaUid } }, 'agenda not found');
  }

  const memberRes = identifier?.constructor.name !== 'Object'
    ? await members.get({
      agendaUid: agenda.uid,
      userUid: identifier,
    }, { ...preloadedOptions, ...options }).then(m => (m ? format(services.members, m, { detailed, roleAsSlug }) : null))
    : await members.get.byEmail({
      agendaUid: agenda.uid,
      ...identifier,
    }, { ...preloadedOptions, ...options }).then(m => (m ? format(services.members, m, { detailed, roleAsSlug }) : null));

  if (!canRead(services, {
    access,
    actingMember,
    actingUserUid,
    userUid: memberRes?.userUid || identifier,
  })) {
    throw new Forbidden('Not authorized to access member');
  }

  const schemas = await getMemberSchema(services, agenda.uid, { access, actingMember });

  if (!schemas.agendaSchema && returnIsValid) {
    return {
      member: memberRes,
      isValid: validateMemberData(memberRes, schemas.merged),
    };
  }

  if (!schemas.agendaSchema || !memberRes) {
    return memberRes;
  }

  const customRes = await custom(schemas.agendaSchema.id).get(memberRes.userUid);
  const completedMemberData = { ...memberRes, ...customRes };

  if (returnIsValid) {
    return {
      member: completedMemberData,
      isValid: validateMemberData(completedMemberData, schemas.merged),
    };
  }

  return completedMemberData;
}

export default Object.assign((services, agendaOrUid, identifier, options) => get(
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
