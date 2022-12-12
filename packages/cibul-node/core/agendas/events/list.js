'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/events/list');
const getAgendaWithNetworkAndSchemas = require('../utils/getAgendaWithNetworkAndSchemas');
const merge = require('../utils/merge');

// this will be slower for bigger sets
// keep it fast with a last id nav on agendaEvents
module.exports = async (services, agendaUid, query = {}, nav = {}, options = {}) => {
  const {
    agendaEvents: agendaEventsSvc,
    events: eventsSvc,
    custom,
    agendas,
    members,
    users,
  } = services;

  const {
    lastId,
    limit,
  } = {
    limit: 20,
    lastId: 0,
    ...nav,
  };

  const {
    load,
    returnPayload,
    access,
    detailed,
  } = {
    load: {
      event: true,
      agendaEvent: true,
      custom: true,
      member: true,
      user: true,
    },
    returnPayload: false,
    access: 'public',
    detailed: false,
    ...options,
  };

  const fetched = {};

  const agenda = await getAgendaWithNetworkAndSchemas(services, agendaUid);

  const formSchema = merge.schemasWithEvent(
    agenda?.network?.formSchema ?? null,
    agenda.formSchema,
    {
      access: access !== null ? { read: access } : null,
    },
  );

  const {
    lastId: newLastId,
    items: agendaEvents,
  } = await agendaEventsSvc(agendaUid).listByLastId(query, lastId, limit, {
    decorate: detailed ? ['sourceAgendas'] : [],
  });

  if (load.agendaEvent) {
    fetched.agendaEvents = agendaEvents;
  }

  const eventUids = agendaEvents.map(ae => ae.eventUid);

  if (load.event) {
    log('loading %s events', eventUids.length);
    fetched.events = await eventsSvc.list({
      uid: eventUids,
    }, { limit: eventUids.length }, {
      detailed,
      private: null, // needed to reindex private agendas
      access: access === 'internal' ? 'internal' : 'public',
    });
  }

  if (load.custom && agenda.formSchemaId) {
    log('loading custom data');
    fetched.custom = (await custom(agenda.formSchemaId).list({
      identifier: eventUids,
    })).items;
  }

  if (load.custom && agenda.network && agenda.network.formSchemaId) {
    fetched.networkCustom = (await custom(agenda.network.formSchemaId).list({
      identifier: eventUids,
    })).items;
  }

  if (detailed && load.event) {
    fetched.originAgendas = (await agendas.list({
      uid: fetched.events.map(e => e.agendaUid),
    })).agendas.map(a => _.omit(a, ['id', 'indexed']));
  }

  const userUids = detailed && agendaEvents.length ? agendaEvents.map(ae => ae.userUid).filter(userUid => !!userUid) : [];

  if (detailed && load.member && agendaEvents.length) {
    fetched.members = await members.list({
      agendaUid: agenda.uid,
      userUid: userUids,
    }, { limit }).then(rows => rows.map(m => _.pick(m, ['role', 'userUid', 'custom'])));
  }

  if (detailed && load.user && agendaEvents.length) {
    fetched.users = await users.find({
      query: {
        uid: {
          $in: userUids,
        },
        $limit: agendaEvents.length,
      },
      detailed: false,
    }).then(({
      data,
    }) => data.map(d => _.pick(d, ['uid', 'fullName', 'culture'])));
  }

  const compiledEvents = eventUids.map((uid, index) => {
    const event = _.find(fetched.events, { uid });
    if (load.event && !event) {
      log('warn', 'event uid %s was not found', uid);
      return null;
    }
    return {
      uid,
      ...merge.eventFromObject({
        agendaEvent: fetched.agendaEvents[index],
        event: load.event ? event : null,
        custom: load.custom ? {
          agenda: (_.find(fetched.custom, { identifier: uid }) || {}).custom,
          network: (_.find(fetched.networkCustom, { identifier: uid }) || {}).custom,
        } : null,
      }, {
        includeFields: formSchema.fields.map(f => f.field),
        originAgenda: load.event ? _.find(fetched.originAgendas, { uid: event.agendaUid }) : null,
        member: load.member ? _.find(fetched.members, { userUid: fetched.agendaEvents[index].userUid }, null) : null,
        user: load.user && fetched.users ? fetched.users.find(u => u.uid === fetched.agendaEvents[index].userUid) : null,
        load,
      }),
    };
  }).filter(event => !!event);

  return returnPayload ? {
    lastId: newLastId,
    events: compiledEvents,
    success: true,
    agenda,
    formSchema,
  } : compiledEvents;
};
