'use strict';

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

const getAgendaUserEventStats = require('./lib/getAgendaUserEventStats');

const validateOptions = require('./lib/validateAgendaContextOptions');

module.exports = async function getAgendaUserContext(core, identifier, agendaUid, options = {}) {
  const {
    includes
  } = validateOptions(options);

  const context = {};

  if (includes.filter(i => i.indexOf('me') === 0)) {
    context.me = {};
  }

  if (includes.includes('me.member')) {
    context.me.member = await core
      .agendas(agendaUid).members
      .get(identifier, options);
  }

  if (includes.includes('me.authorizations')) {
    context.me.authorizations = await getUserAuthorizationsOnAgenda(core, identifier, agendaUid);
  }

  if (includes.includes('me.events')) {
    context.me.events = await getAgendaUserEventStats(core, identifier, agendaUid);
  }

  return context;
};
