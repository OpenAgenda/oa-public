'use strict';

const log = require('@openagenda/logs')('services/eventSearch/add');

const formatEventForIndex = require('./lib/formatEventForIndex');
const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');
const hasOtherPublishedReferences = require('./lib/hasOtherPublishedReferences');

module.exports = (services, queue, eventSearch) => {
  const {
    agendaEvents
  } = services;

  return async ({ agenda, member, formSchema, event }) => {
    log('add');

    const data = formatEventForIndex(agenda, formSchema, event, member);
    const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

    if (!await searchIndex.exists()) {
      log('warn', 'not adding: index does not exist');
      return;
    }

    const result = await searchIndex.add(data, { refresh: true });

    log('added', result);

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
