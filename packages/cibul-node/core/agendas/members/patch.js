'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest } = require('@openagenda/verror');
const format = require('./lib/format');
const canEdit = require('./lib/canEdit');

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

  const patchData = {};

  const custom = format.custom(data);

  if (Object.keys(custom).length) {
    patchData.custom = custom;
  }

  if (data.role !== undefined) {
    patchData.role = members.utils.getRoleCode(data.role);
  }

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid
  });

  if (!canEdit(services, {
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
