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
    getCompiledEvent: getCompiledEvent.bind(null, data),
    getEvent: getEvent.bind(null, data),
    getMember: getMember.bind(null, data),
    getFormSchema: getFormSchema.bind(null, data.agendas.current),
    getItem,
    hasItem: key => getItem(key),
    getPrimaryKey: () => primaryKey
  }
}

function makeGetResponse(services, data) {
  return async (primaryKey = 'event', access = null) => {
    data.agendas.origin =  await loadOriginAgenda(services, data);
    return {
      success: true,
      agenda: data.agendas.current,
      originAgenda: data.agendas.origin,
      member: getMember(data),
      formSchema: getFormSchema(data.agendas.current, access),
      [primaryKey]: getCompiledEvent(data, 'after', access),
      before: data.services.before.agendaEvent ? merge.eventFromObject(data.services.before) : null
    }
  }
}

function getFormSchema(agenda, access = null) {
  return merge.schemasWithEvent(
    _.get(agenda, 'network.formSchema'),
    _.get(agenda, 'formSchema'), // there, the event schema is not set.
    access !== null ? {
      access: { read: access }
    } : null
  );
}

function getCompiledEvent(data, key = 'after', access = null) {
  return merge.eventFromObject(data.services[key], {
    includeFields: access !== null ? getFormSchema(data.agendas.current, access).fields.map(f => f.field) : null,
    originAgenda: _.pick(data.agendas.origin, ['uid', 'slug', 'title', 'description', 'image', 'url'])
  });
}

function getEvent(data, key) {
  if (key) {
    return data.services[key].event;
  }

  return data.services.before.event || data.services.after.event;
}

function getMember(data) {
  return _.get(data, 'services.after.agendaEvent.member', null);
}

function loadOriginAgenda(services, data) {
  const event = data.services.after.event || data.services.before.event;

  if (!event || !event.agendaUid) {
    return null;
  }

  if (data.agendas.current.uid === event.agendaUid) {
    return data.agendas.current;
  }

  return services.agendas.get({
    uid: event.agendaUid
  }, { private: null });
}

function setItem({ services }, name, ...args) {
  _.set(services, `before.${name}`, args.length === 2 ? args[0] : null);
  _.set(services, `after.${name}`, args.length === 2 ? args[1] : args[0]);
}
