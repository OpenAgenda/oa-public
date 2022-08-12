'use strict';

module.exports = async function userEventsSearch(core, identifier, agendaUid, query, nav, options = {}) {
  const isOwn = parseInt(options.userUid, identifier) === parseInt(identifier, 10);
  const searchOptions = {
    ...options
  };

  if (isOwn) {
    searchOptions.access = 'internal';
  }

  return core.agendas(agendaUid).events.search({
    ...query,
    ownerUid: identifier
  }, nav, searchOptions);
};
