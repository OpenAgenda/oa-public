'use strict';

const log = require('@openagenda/logs')('services/eventSearch/agendaIndexRebuild');

const formatEventForIndex = require('./lib/formatEventForIndex');
const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');

module.exports = async (services, eventSearch, agenda) => {
  const {
    core
  } = services;

  const logPrefix = `${agenda.slug} (${agenda.uid}):`;

  log(logPrefix + ' starting');

  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  const result = await searchIndex.rebuild({
    on: {
      bulk: ({ lastId, counts, result }) => {
        log('info', `${logPrefix} bulked ${counts.indexed} events`, lastId);
      },
      error: ({ result, lastId }) => {
        log('error', `${logPrefix} bulk failed`, { result, lastId });
      }
    },
    eventsList: eventsList.bind(null, core, agenda)
  });

  log(logPrefix + ' done');

  return result;
}


async function eventsList(core, agenda, lastId, limit) {
  const {
    lastId: newLastId,
    events
  } = await core.agendas(agenda.uid).events.list({}, {
    lastId,
    limit
  }, {
    returnPayload: true,
    detailed: true
  }).then(({ events, formSchema, agenda, lastId }) => ({
    lastId,
    events: events.map(event => formatEventForIndex({
      agenda,
      formSchema,
      event,
      member: event.member
    }))
  }));

  return {
    lastId: newLastId,
    events
  }
}
