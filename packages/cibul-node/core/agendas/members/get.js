'use strict';

const getAgenda = require('../utils/getAgenda');
const format = require('./lib/format');

async function get(services, preloadedOptions, agendaOrUid, userUid) {
  const {
    members,
  } = services;

  const agenda = await getAgenda(services, agendaOrUid);

  return members.get({
    agendaUid: agenda.uid,
    userUid
  }, preloadedOptions).then(m => (m ? format(services.members, m) : null));
}

module.exports = Object.assign((services, agendaOrUid, userUid) => get(
  services,
  { throwOnNotFound: true },
  agendaOrUid,
  userUid
), {
  is: (services, agendaOrUid, userUid) => get(
    services,
    { includeFields: ['id'] },
    agendaOrUid,
    userUid
  ).then(m => !!m)
});
