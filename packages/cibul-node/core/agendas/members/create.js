'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest } = require('@openagenda/verror');
const getAgenda = require('../utils/getAgenda');
const format = require('./lib/format');
const canCreate = require('./lib/canCreate');

module.exports = async (services, agendaOrUid, userUid, role, data, options = {}) => {
  const {
    members,
    users
  } = services;

  const {
    userUid: actingUserUid,
    access = null
  } = options;

  if (!actingUserUid && access !== 'internal') {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const agenda = await getAgenda(services, agendaUid, { detailed: true });

  const memberData = {
    ...(data || {}),
  };

  if (options.useAccountEmail) {
    memberData.email = await users.get(userUid).then(u => u.email);
  }

  const actingMember = actingUserUid ? await members.get({
    agendaUid,
    userUid: actingUserUid
  }) : null;

  if (!canCreate(services, {
    agenda,
    acting: actingMember,
    actingUserUid,
    userUid,
    role,
    access
  })) {
    throw new Forbidden('Not authorized to add a member');
  }

  return members.create({
    agendaUid,
    userUid,
    role: members.utils.getRoleCode(role ?? 'contributor'),
    custom: format.custom(memberData)
  }, { requireCustom: false }).then(result => format(members, result.member));
};
