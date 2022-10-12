'use strict';

const { Forbidden } = require('@openagenda/verror');
const format = require('./lib/format');
const canRead = require('./lib/canRead');

async function get(core, preloadedOptions, agendaOrUid, userUid, options = {}) {
  const { services } = core;
  const {
    members,
    custom,
  } = services;

  const {
    userUid: actingUserUid,
    access = null,
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

  const agenda = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid : await core.agendas(agendaOrUid).get({ detailed: true, access });

  const memberRes = await members.get({
    agendaUid: agenda.uid,
    userUid,
  }, { ...preloadedOptions, ...options }).then(m => (m ? format(services.members, m, {}) : null));

  if (!agenda.memberSchemaId) {
    return memberRes;
  }
  const customRes = await custom(agenda.memberSchemaId).get(userUid);
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
  ).then(m => !!m),
});
