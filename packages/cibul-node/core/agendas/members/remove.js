'use strict';

const { Forbidden, BadRequest } = require('@openagenda/verror');
const canEdit = require('./lib/canEdit');

module.exports = async (core, agendaOrUid, identifiers, options = {}) => {
  const { services } = core;
  const {
    members,
    users,
    custom,
    agendas,
  } = services;

  const {
    userUid: actingUserUid,
  } = options;

  if (!actingUserUid) {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = agendaOrUid?.constructor.name === 'Object' ? agendaOrUid.uid : agendaOrUid;

  const member = await members.get({
    agendaUid,
    ...identifiers,
  });

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid,
  });

  const actingUser = await users.findOne({ query: { uid: actingUserUid } });

  if (!canEdit(services, {
    acting: actingMember,
    userUid: member.userUid,
  })) {
    throw new Forbidden('Not authorized to patch member');
  }

  const memberRes = await members.remove(member.id, {
    context: {
      user: actingUser,
    },
  });

  const agenda = agendaOrUid?.constructor.name === 'Object'
    ? agendaOrUid
    : await agendas.get({ detailed: true, uid: agendaUid });

  if (!agenda.memberSchemaId) {
    return memberRes;
  }

  const customRes = await custom(agenda.memberSchemaId).remove(member.userUid);
  return { ...memberRes, ...customRes };
};
