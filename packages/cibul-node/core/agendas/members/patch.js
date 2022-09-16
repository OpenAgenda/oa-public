'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest } = require('@openagenda/verror');
const format = require('./lib/format');
const canEdit = require('./lib/canEdit');

module.exports = async (services, agendaOrUid, identifiers, data, options = {}) => {
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

  const member = await members.get({
    agendaUid,
    ...identifiers
  });

  if (data.role !== undefined && (members.utils.getRoleCode(data.role) !== member.role)) {
    patchData.role = members.utils.getRoleCode(data.role);
  }

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid
  });

  if (!canEdit(services, {
    acting: actingMember,
    userUid: member.userUid,
    role: patchData.role
  })) {
    throw new Forbidden('Not authorized to patch member');
  }

  return members.patch(member.id, patchData, {
    throwOnError: true,
    requireCustom: false,
    context: {
      sender: {
        userUid: actingUserUid,
        memberName: actingMember?.custom?.contactName,
      }
    }
  }).then(result => format(members, result.member));
};
