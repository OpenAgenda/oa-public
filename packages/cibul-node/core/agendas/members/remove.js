'use strict';

const _ = require('lodash');
const { Forbidden, BadRequest } = require('@openagenda/verror');
const canEdit = require('./lib/canEdit');

module.exports = async (services, agendaOrUid, userUid, options = {}) => {
  const {
    members,
    users
  } = services;

  const {
    userUid: actingUserUid
  } = options;

  if (!actingUserUid) {
    throw new BadRequest('userUid option is required');
  }

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const actingMember = await members.get({
    agendaUid,
    userUid: actingUserUid
  });

  const actingUser = await users.findOne({ query: { uid: actingUserUid } });

  if (!canEdit(services, {
    acting: actingMember,
    actingUserUid,
    userUid
  })) {
    throw new Forbidden('Not authorized to patch member');
  }

  return members.remove({
    agendaUid,
    userUid,
  }, {
    context: {
      user: actingUser
    }
  });
};
