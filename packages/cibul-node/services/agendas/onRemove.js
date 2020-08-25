'use strict';

const log = require('@openagenda/logs')('services/agendas/onRemove');

module.exports = async (services, agenda) => {
  const {
    inboxes: { Inbox },
    agendaSearch,
    activities
  } = services;

  try {
    await agendaSearch.remove(agenda);
  } catch (e) {
    log('error', 'failed to index agenda', e);
  }

  // inbox
  log('remove inbox (agenda uid %d)', agenda.uid);
  new Inbox().remove({ type: 'agenda', identifier: agenda.uid }).then(_.noop);

  // feed / activity
  activities.feed({ entityType: 'agenda', entityUid: agenda.uid }).remove();
}
