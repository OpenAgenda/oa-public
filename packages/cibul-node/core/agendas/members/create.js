'use strict';

const _ = require('lodash');
const { Forbidden } = require('@openagenda/verror');
const getAgenda = require('../utils/getAgenda');
const format = require('./lib/format');
const canCreate = require('./lib/canCreate');

module.exports = async (services, agendaOrUid, userUid, role, data, options = {}) => {
  const {
    members,
    users
  } = services;

  const {
    userUid: actingUserUid
  } = options;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const agenda = await getAgenda(services, agendaUid, { detailed: true });

  const memberData = {
    ...(data || {}),
  };

  if (options.useAccountEmail) {
    memberData.email = await users.get(userUid).then(u => u.email);
  }

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid
  });

  if (!canCreate(services, {
    agenda,
    acting: actingMember,
    actingUserUid,
    userUid,
    role
  })) {
    throw new Forbidden('Not authorize to edit requested role');
  }

  return members.create({
    agendaUid,
    userUid,
    role: members.utils.getRoleCode(role),
    custom: format.custom(memberData)
  }, { requireCustom: false }).then(result => format(members, result.member));
};
