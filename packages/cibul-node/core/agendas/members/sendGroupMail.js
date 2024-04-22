'use strict';

const getAgenda = require('../utils/getAgenda');

module.exports = async function sendGroupMail(core, agendaUid, memberOrUid, query, data, options = {}) {
  const {
    services: {
      members,
    },
  } = core;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  const member = typeof memberOrUid === 'number' ? await members.get({
    agendaUid,
    userUid: memberOrUid,
  }, { detailed: true }) : memberOrUid;

  if (!member.user) {
    member.user = options.user || await core.users.get(member.userUid);
  }

  return members.sendGroupMail(
    agenda,
    member,
    query,
    data,
    {
      lang: options.lang,
    },
  );
};
