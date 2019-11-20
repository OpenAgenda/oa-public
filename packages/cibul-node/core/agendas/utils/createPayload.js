'use strict';

const _ = require('lodash');
const merge = require('./merge');

module.exports = (services, agenda, primaryKey, options) => {
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

  const getItem = key => _.get(data.services.after, key);

  return {
    setItem: setItem.bind(null, data),
    getResponse: makeGetResponse(services, data, primaryKey),
    getAgenda: () => data.agendas.current,
    getEvent: () => data.services.before.event || data.services.after.event,
    getItem,
    hasItem: key => getItem(key)
    getPrimaryKey: () => primaryKey
  }
}

function makeGetResponse(services, data, primaryKey) {
  let response = null;
  return async (fullPayload = false, clear = false) => {
    if (!fullPayload) {
      return merge.eventFromObject(data.services.after);
    }
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
        [primaryKey]: merge.eventFromObject(data.services.after),
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

function setItem({ services }, name, ...args) {
  _.set(services, `before.${name}`, args.length === 2 ? args[0] : null);
  _.set(services, `after.${name}`, args.length === 2 ? args[1] : args[0]);
}
