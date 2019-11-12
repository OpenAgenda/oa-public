'use strict';

const log = require('@openagenda/logs')('services/eventSearch/update');
const formatEventForIndex = require('./lib/formatEventForIndex');
const getAgendaSearchIndex = require('./lib/getAgendaSearchIndex');

module.exports = ({ core, agendaEvents, eventSearch, queue }) => {
  queue.register({
    loadOtherUpdates: loadOtherUpdates.bind(null, { agendaEvents, eventSearch, queue }),
    otherUpdate: otherUpdate.bind(null, { eventSearch, core })
  });

  return async ({agenda, member, formSchema, event}) => {

    // is the provided agenda the origin agenda or is it the currently edited agenda?
    const data = formatEventForIndex(agenda, formSchema, event, member);
    const searchIndex = getAgendaSearchIndex(agenda.uid);

    if (!await searchIndex.exists()) {
      log('warn', 'not updating: index does not exist');
    }

    // update the agenda index
    await searchIndex.update({
      uid: event.uid
    }, data, { refresh: true });

    if (event.state !== 2 && !await hasOtherPublishedReferences(agendaEvents, agenda.uid, eventUid) ) {
      await queue('eventIndexRemove', data);
    } else {
      await queue('eventIndexUpdate', data);
    }
    // queue to update the remaining impacted agenda indices
    // await queue('loadOtherUpdates', agenda.uid, data.event.uid);

    log('done');
  };
}

async function loadOtherUpdates({ agendaEvents, eventSearch, queue }, agendaUid, eventUid) {
  const remainingAgendaUids = await agendaEvents.list.byEventUid(eventUid, {
    excludeAgendaUid: agendaUid
  }, 0, 1000).then(r => r.items.map(ae => ae.agendaUid));

  // here you know if it is published somewhere or not

  for (const remainingAgendaUid of remainingAgendaUids) {
    await queue('otherUpdate', remainingAgendaUid, eventUid);
  }
}

function otherUpdate({ eventSearch, core }, agendaUid, eventUid) {
  log('otherUpdate', agendaUid, eventUid);
  // core get needs some work IAMHERE
  // core get to get info to
  /**
   const data = formatEventForIndex(agenda, formSchema, event, member);
   await searchIndex.update({
      uid: event.uid
    }, data, { refresh: true });
   */
}
