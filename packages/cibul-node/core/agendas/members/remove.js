'use strict';

const _ = require('lodash');

module.exports = async (services, agendaOrUid, userUid) => {
  const {
    members,
  } = services;

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  return members.remove({
    agendaUid,
    userUid,
  });
};
