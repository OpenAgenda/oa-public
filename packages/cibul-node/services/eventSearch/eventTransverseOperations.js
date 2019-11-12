'use strict'

const _ = require('lodash');
const events = require('@openagenda/events');
const agendaEvents = require('@openagenda/agenda-events');
const rebuildLimit = process.env.NODE_ENV === 'production' ? 16000 : 2000;
const log = require('@openagenda/logs')('services/eventSearch/eventTransverseOperations');
const VError = require('verror');

module.exports = ({ eventSearch, agendaIndices, queue }) => {
  const index = eventSearch('events');

  const eventIndexOperations = {
    add: add.bind(null, { index, queue }),
    update: update.bind(null, index),
    remove: remove.bind(null, index)
  };

  queue.register({
    ...eventIndexOperations,
    agendaIndexUpdate: agendaIndexUpdate.bind(null, agendaIndices),
    agendaIndexRemove: agendaIndexRemove.bind(null, agendaIndices),
  });

  return Object.assign(search.bind(null, index), {
    batch: {
      update: batch.bind(null, { agendaIndices, queue }, 'update'),
      remove: batch.bind(null, { agendaIndices, queue }, 'remove')
    },
    ...eventIndexOperations,
    rebuild
  });
}

async function search(index, query = null, nav = null, options = null) {
  return index.search(query, nav, options);
}

async function add({ index, queue }, eventUid, options = {}) {
  if (options.queue) {
    return queue('add', eventUid, _.omit(options, ['queue']));
  }

  const result = await index.add(
    await _getEvent(eventUid),
    Object.assign({ expire: true }, options)
  );

  if (!result.success && result.message === 'negative ttl set') {
    log('info', 'past event was not indexed', { eventUid });

    return {
      success: true
    }
  }

  return result;
}

async function update(index, eventUid) {
  return index.update({
    uid: eventUid
  }, await _getEvent(eventUid), {
    expire: true
  });
}

async function remove(index, eventUid) {
  log( 'info', 'removing event %d from transverse index', eventUid);

  return index.remove({ uid: eventUid });
}

async function rebuild(index) {
  const createdAt = new Date();

  createdAt.setDate(createdAt.getDate() - 120);

  return index.rebuild({
    expire: true,
    eventsList: async (offset, limit) => {
      if (offset > rebuildLimit) return [];

      log( 'info', 'rebuilding event index, offset %s', offset );

      return events.list({
        createdAt
      }, offset, limit, {
        detailed: true,
        html: true
      }).then(r => r.events);
    }
  });
}

async function agendaIndexUpdate(agendaIndices, agendaUid, eventUid) {
  return agendaIndices(agendaUid)
    .update(await agendaEvents(agendaUid).get(eventUid), {
      refresh: false
    });
}

async function agendaIndexRemove(agendaIndices, agendaUid, eventUid) {
  return agendaIndices(agendaUid)
    .remove(await agendaEvents(agendaUid).get(eventUid), {
      refresh: false
    })
}


/**
 * unused in normal lifecycle of app. agendaEvent interfaces ensure event
 * removal from agenda indices
 */
async function batch({ agendaIndices, queue }, method, event, context = {}) {

  // main agenda
  const {
    agendaUid,
    updateEventSearchIndex
  } = context;

  if (agendaUid && updateEventSearchIndex) {
    const ae = await agendaEvents(agendaUid).get(event.uid);

    if (ae) {
      await agendaIndices(agendaUid)[method](ae);
    }
  }

  // update general event index
  await queue(method, event.uid);

  const remainingAgendaUids = await agendaEvents.list.byEventUid(event.uid, 0, 1000)
    .then(result => result
      .items.filter(ae => ae.agendaUid !== agendaUid)
      .map(ae => ae.agendaUid)
  );

  for (const remainingAgendaUid of remainingAgendaUids) {
    await queue(
      method === 'update' ? 'agendaIndexUpdate' : 'agendaIndexRemove',
      remainingAgendaUid,
      event.uid
    )
  }
}

async function _getEvent(eventUid) {
  const event = await events.get({
    uid: eventUid
  }, { private: null });

  if (!event) throw new VError('Event %s not found', eventUid);

  return event;
}
