'use strict';

const _ = require('lodash');
// const log = require('@openagenda/logs')('core/agendas/utils/createPayload');
const merge = require('./merge');

const cleanAccess = dirty => {
  if (!dirty) {
    return null;
  }
  return dirty === 'internal' ? null : dirty;
};

function getFormSchema(agenda, dirtyAccess = null) {
  const access = cleanAccess(dirtyAccess);
  return merge.schemasWithEvent(
    agenda?.network?.formSchema,
    agenda?.formSchema,
    {
      access: access !== null ? { read: access } : null,
    },
  );
}

async function getOriginAgenda(services, data) {
  const event = data.services.after.event || data.services.before.event;

  if (!data.agendas.origin && (!event || !event.agendaUid)) {
    return null;
  }

  if (!data.agendas.origin && (data.agendas.current.uid === event.agendaUid)) {
    data.agendas.origin = data.agendas.current;
  } else if (!data.agendas.origin) {
    data.agendas.origin = await services.agendas.get({
      uid: event.agendaUid,
    }, { private: null });
  }

  return _.pick(data.agendas.origin, [
    'uid',
    'slug',
    'title',
    'description',
    'image',
    'url',
  ]);
}

async function getCompiledEvent(services, data, key = 'after', access = null, formSchema = null, loadOption = null) {
  const load = loadOption || {
    custom: true,
    event: true,
    agendaEvent: true,
    agenda: true,
    member: true,
  };
  const includeFields = access === null ? null : (
    formSchema || getFormSchema(data.agendas.current, access)
  ).fields.map(f => f.field);

  return merge.eventFromObject(data.services[key], {
    includeFields,
    originAgenda: await getOriginAgenda(services, data),
    member: data.member,
    load,
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

function makeGetResponse(services, data) {
  return async (primaryKey = 'event', options = {}) => {
    const {
      access,
      load,
    } = {
      access: null,
      load: {
        custom: true,
        event: true,
        agendaEvent: true,
        agenda: true,
        member: true,
      },
      ...typeof options === 'object' ? options : { access: options },
    };

    const formSchema = getFormSchema(data.agendas.current, access);
    const member = getMember(data);

    if (!['public', 'contributor'].includes(access) && load.member) {
      data.member = member;
    }
    return {
      success: true,
      agenda: data.agendas.current,
      originAgenda: await getOriginAgenda(services, data),
      member,
      formSchema,
      [primaryKey]: await getCompiledEvent(services, data, 'after', access, formSchema, load),
      before: data.services.before.agendaEvent ? merge.eventFromObject(data.services.before) : null,
    };
  };
}

function setItem({ services }, name, ...args) {
  _.set(services, `before.${name}`, args.length === 2 ? args[0] : null);
  _.set(services, `after.${name}`, args.length === 2 ? args[1] : args[0]);
}

module.exports = function createPayload(services, agenda, primaryKey) {
  const data = {
    agendas: {
      current: agenda,
      origin: null,
    },
    services: {
      before: {},
      after: {},
    },
  };

  const getItem = key => _.get(data.services.after, key);

  return {
    setItem: setItem.bind(null, data),
    getResponse: makeGetResponse(services, data, primaryKey),
    getAgenda: () => data.agendas.current,
    getCompiledEvent: getCompiledEvent.bind(null, services, data),
    getEvent: getEvent.bind(null, data),
    getMember: getMember.bind(null, data),
    getFormSchema: getFormSchema.bind(null, data.agendas.current),
    getItem,
    hasItem: key => getItem(key),
    getPrimaryKey: () => primaryKey,
  };
};
