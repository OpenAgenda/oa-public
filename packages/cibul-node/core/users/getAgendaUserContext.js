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

  const member = includes.includes('me.member') || includes.includes('events') ? await core
    .agendas(agendaUid).members
    .get(identifier, options) : undefined;

  if (includes.includes('me.member')) {
    context.me.member = member;
  }

  if (includes.includes('me.authorizations')) {
    context.me.authorizations = await getUserAuthorizationsOnAgenda(core, identifier, agendaUid);
  }

  if (includes.includes('me.events')) {
    context.me.events = await getAgendaUserEventStats(core, identifier, agendaUid);
  }

  if (includes.includes('events') && ['administrator', 'moderator'].includes(member?.role)) {
    context.events = await core.agendas(agendaUid).events
      .search({ state: null }, { size: 0 }, {
        aggregations: ['states'],
        access: member.role
      }).then(({ aggregations }) => aggregations);
  }

  return context;
};
