'use strict';

const log = require('@openagenda/logs')('services/eventSearch/agendaIndexRebuild');

const formatEventForIndex = require('./lib/formatEventForIndex');
const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');

module.exports = async (services, eventSearch, agenda) => {
  const {
    core
  } = services;

  log('rebuild index of agenda %s', agenda.uid);

  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  return searchIndex.rebuild({
    eventsList: async (lastId, limit) => {
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

      log('fetched and indexed %s events from lastId %s', events.length, lastId);

      return {
        lastId: newLastId,
        events
      }
    }
  });
}
