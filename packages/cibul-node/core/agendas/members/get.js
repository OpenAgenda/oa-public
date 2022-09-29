'use strict';

const { Forbidden } = require('@openagenda/verror');
const getAgenda = require('../utils/getAgenda');
const getMemberSchema = require('../utils/getMemberSchema');
const format = require('./lib/format');
const canRead = require('./lib/canRead');

async function get(services, preloadedOptions, agendaOrUid, userUid, options = {}) {
  const {
    members,
    custom
  } = services;

  const {
    userUid: actingUserUid,
    access = null
  } = options;

  const agenda = await getAgenda(services, agendaOrUid);

  const actingMember = actingUserUid ? await members.get({
    agendaUid: agenda.uid,
    userUid: actingUserUid
  }) : null;

  if (!canRead(services, {
    access,
    actingMember,
    actingUserUid,
    userUid
  })) {
    throw new Forbidden('Not authorized to access member');
  }

  const memberRes = await members.get({
    agendaUid: agenda.uid,
    userUid
  }, { ...preloadedOptions, ...options }).then(m => (m ? format(services.members, m) : null));

  const schemas = await getMemberSchema(services, agenda.uid, { access, actingMember });
  if (!schemas.agendaSchema) {
    return memberRes;
  }
  const customRes = await custom(schemas.agendaSchema.id).get(userUid);
  return { ...memberRes, ...customRes };
}

module.exports = Object.assign((services, agendaOrUid, userUid, options) => get(
  services,
  { throwOnNotFound: true },
  agendaOrUid,
  userUid,
  options
), {
  is: (services, agendaOrUid, userUid, options = {}) => get(
    services,
    { includeFields: ['id'] },
    agendaOrUid,
    userUid,
    options
  ).then(m => !!m)
});
