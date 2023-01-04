'use strict';

const log = require('@openagenda/logs')('services/eventSearch/agendaIndexRebuild');

const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');

function eventsList(core, agenda) {
  let count = 0;
  return (lastId, limit) => core.agendas(agenda.uid).events.list({}, {
    lastId,
    limit,
  }, {
    returnPayload: true,
    detailed: true,
    access: 'internal',
  }).then(({ events, lastId: nextLastId }) => {
    log('listed %s events for reindexing in agenda %s (cursor: %s, total done: %s)', events.length, agenda.slug, nextLastId, count += events.length);
    return { lastId: nextLastId, events };
  });
}

module.exports = async (services, eventSearch, agenda) => {
  const {
    core,
  } = services;

  const logPrefix = `${agenda.slug} (${agenda.uid}):`;

  log(`${logPrefix} starting`);

  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  const formSchema = await core.agendas(agenda.uid).settings.schema.getMerged();

  const result = await searchIndex.rebuild({
    on: {
      bulk: ({ lastId, counts }) => {
        log('info', `${logPrefix} bulked ${counts.indexed} events`, lastId);
      },
      error: ({ lastId }) => {
        log('error', `${logPrefix} bulk failed`, { result, lastId });
      },
    },
    eventsList: eventsList(core, agenda),
    formSchema,
  });

  log(`${logPrefix} done`, result);

  if (result.error) {
    log('error', result.error?.meta);
  }

  return result;
};
