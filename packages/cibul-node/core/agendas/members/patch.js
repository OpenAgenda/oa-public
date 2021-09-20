'use strict';

const _ = require('lodash');
const format = require('./lib/format');

module.exports = async (services, agendaOrUid, userUid, data) => {
  const {
    members,
  } = services;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const patchData = {
    custom: format.custom(data)
  };

  if (data.role !== undefined) {
    patchData.role = members.utils.getRoleCode(data.role);
  }

  return members.patch({
    agendaUid,
    userUid,
  }, patchData).then(result => format(members, result.member));
};
