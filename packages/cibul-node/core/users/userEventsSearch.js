'use strict';

module.exports = async function userEventsSearch(core, identifier, agendaUid, query, nav, options = {}) {
  const isOwn = parseInt(options.userUid, identifier) === parseInt(identifier, 10);
  const searchOptions = {
    ...options,
  };

  if (isOwn) {
    searchOptions.access = 'internal';
  }

  const {
    relation = [],
  } = query ?? {};

  let filterKey = 'ownerUid';

  if (relation.length === 1 && relation.includes('contributed')) {
    filterKey = 'memberUid';
  } else if (relation.includes('contributed') && relation.includes('owned')) {
    filterKey = 'ownerOrMemberUid';
  }

  const userFilter = {
    [filterKey]: identifier,
  };

  return core.agendas(agendaUid).events.search({
    ...query,
    ...userFilter,
  }, nav, searchOptions);
};
