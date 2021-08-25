'use strict';

const getAgenda = require('../utils/getAgenda');

async function get(services, preloadedOptions, agendaOrUid, userUid) {
  const {
    members,
  } = services;

  const agenda = await getAgenda(services, agendaOrUid);

  return members.get({
    agendaUid: agenda.uid,
    userUid
  }, preloadedOptions);
}

module.exports = Object.assign((services, agendaOrUid, userUid) => get(
  services,
  {},
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
