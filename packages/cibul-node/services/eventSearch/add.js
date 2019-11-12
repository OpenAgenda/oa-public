'use strict';

const log = require('@openagenda/logs')('services/eventSearch/addToEventIndex');

const formatEventForIndex = require('./lib/formatEventForIndex');
const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');
const hasOtherPublishedReferences = require('./lib/hasOtherPublishedReferences');

module.exports = ({ eventSearch, agendaEvents, queue }) => {

  return async ({ agenda, member, formSchema, event }) => {
    const data = formatEventForIndex(agenda, formSchema, event, member);
    const searchIndex = getAgendaSearchIndex(agenda.uid);

    if (!await searchIndex.exists()) {
      log('warn', 'not updating: index does not exist');
    }

    await searchIndex.add({
      uid: event.uid
    }, data, { refresh: true });

    if (event.state !== 2) {
      log('done');
      return;
    }

    if (!await hasOtherPublishedReferences(agendaEvents, agenda.uid, event.uid)) {
      await queue('eventIndexUpdate', data);
    }

    log('done');
  }
}
