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
  return async (primaryKey = 'event', options = {}) => {
    const {
      access,
      customOnly
    } = {
      access: null,
      customOnly: false,
      ...(typeof options === 'object' ? options : { access: options })
    };

    data.agendas.origin =  await loadOriginAgenda(services, data);
    const formSchema = getFormSchema(data.agendas.current, access);
    return {
      success: true,
      agenda: data.agendas.current,
      originAgenda: data.agendas.origin,
      member: getMember(data),
      formSchema,
      [primaryKey]: getCompiledEvent(data, 'after', access, formSchema, customOnly),
      before: data.services.before.agendaEvent ? merge.eventFromObject(data.services.before) : null
    }
  }
}

function getFormSchema(agenda, access = null) {
  return merge.schemasWithEvent(
    _.get(agenda, 'network.formSchema'),
    _.get(agenda, 'formSchema'),
    access !== null ? { read: access } : null
  );
}

function getCompiledEvent(data, key = 'after', access = null, formSchema = null, customOnly = false) {
  const originAgenda = _.pick(data.agendas.origin, [
    'uid', 'slug', 'title', 'description', 'image', 'url'
  ]);
  const includeFields = access === null ? null : (
      formSchema || getFormSchema(data.agendas.current, access)
    ).fields.map(f => f.field);
  return merge.eventFromObject(data.services[key], {
    includeFields,
    originAgenda,
    customOnly
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
