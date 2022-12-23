'use strict';

const log = require('@openagenda/logs')('agendaEvents/onRemove');

module.exports = async ({ services }, ae, context) => {
  log('removed agenda-event %j', ae, { context });

  const {
    elasticsearch: legacyEventSearch,
  } = services;

  // in the case of a deletion, unique legacy ES ref is removed in event interface
  if (!context.deletion) {
    try {
      await legacyEventSearch.updateEvent({ uid: ae.eventUid }, { removeUnreferenced: true });
    } catch (e) {
      log('error', 'could not update legacy search for event %s', ae.eventUid);
    }
  }
};
