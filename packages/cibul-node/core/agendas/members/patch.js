'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest } = require('@openagenda/verror');
const format = require('./lib/format');
const canPatch = require('./lib/canPatch');

module.exports = async (services, agendaOrUid, userUid, data, options = {}) => {
  const {
    members
  } = services;

  const {
    userUid: actingUserUid
  } = options;

  if (!actingUserUid) {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const patchData = {
    custom: format.custom(data)
  };

  if (data.role !== undefined) {
    patchData.role = members.utils.getRoleCode(data.role);
  }

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid
  });

  if (!canPatch(services, {
    acting: actingMember,
    actingUserUid,
    userUid,
    role: data.role
  })) {
    throw new Forbidden('Not authorized to patch member');
  }

  return members.patch({
    agendaUid,
    userUid
  }, patchData, {
    throwOnError: true,
    requireCustom: false
  }).then(result => format(members, result.member));
};
