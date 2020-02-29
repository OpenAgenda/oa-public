'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('services/members/getEventCountByUserUid');

module.exports = (services, agendaUid, userUids = []) => {
  const {
    agendaEvents
  } = services;

  if (!agendaUid) return [];

  log('processing %d %j', agendaUid, _.uniq(userUids));

  return agendaEvents(agendaUid).stats.countByUserUid(_.uniq(userUids));
}
