'use strict';

const _ = require('lodash');
const format = require('./lib/format');

module.exports = async (services, agendaOrUid, userUid, role, data, options = {}) => {
  const {
    members,
    users
  } = services;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const memberData = {
    ...(data || {}),
  };

  if (options.useAccountEmail) {
    memberData.email = await users.get(userUid).then(u => u.email);
  }

  return members.create({
    agendaUid,
    userUid,
    role: members.utils.getRoleCode(role),
    custom: format.custom(memberData)
  }, { requireCustom: false }).then(result => format(members, result.member));
};
