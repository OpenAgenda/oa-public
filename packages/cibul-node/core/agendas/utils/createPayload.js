'use strict';

const _ = require('lodash');
const merge = require('./merge');

module.exports = (services, agenda, operation) => {
  const data = {
    agendas: {
      current: agenda,
      origin: null
    },
    services: {
      before: {},
      after: {}
    }
  };

  return {
    setItem: setItem.bind(null, data),
    getResponse: makeGetResponse(services, data, operation),
    getAgenda: () => data.agendas.current,
    getEvent: () => data.services.before.event || data.services.after.event,
    getItem: key => _.get(data.services.after, key),
    getOperation: () => operation
  }
}

function makeGetResponse(services, data, operation) {
  let response = null;
  return async clear => {
    if (clear || !response) {
      await loadOriginAgenda(services, data);

      response = {
        success: true,
        agenda: data.agendas.current,
        originAgenda: data.agendas.origin,
        member: _.get(data, 'services.after.agendaEvent.member', null),
        formSchema: merge.schemasWithEvent(
          _.get(data, 'agendas.current.network.formSchema'),
          _.get(data, 'agendas.current.formSchema') // there, the event schema is not set.
        ),
        [operation]: merge.eventFromObject(data.services.after),
        before: data.services.before.agendaEvent ? merge.eventFromObject(data.services.before) : null
      }
    }
    return response;
  }
}

async function loadOriginAgenda(services, data) {
  const event = data.services.after.event;

  if (!event || !event.agendaUid) return null;

  if (data.agendas.current.uid === event.agendaUid) {
    data.agendas.origin = data.agendas.current;
  } else {
    data.agendas.origin = await services.agendas.get({
      uid: event.agendaUid
    }, { private: null });
  }

  return data.agendas.origin;
}

function setItem({ services }, name, before, after) {
  _.set(services, `before.${name}`, before);
  _.set(services, `after.${name}`, after);
}
