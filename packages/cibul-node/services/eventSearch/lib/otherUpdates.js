import logs from '@openagenda/logs';
import updateAgendaIndex from './updateAgendaIndex.js';

const log = logs('services/eventSearch/otherUpdates');

export async function loadOtherUpdates(
  services,
  queue,
  { agendaUid, eventUid },
) {
  const { agendaEvents } = services;

  log('loadOtherUpdates');
  const remainingAgendaUids = await agendaEvents.list
    .byEventUid(
      eventUid,
      {
        excludeAgendaUid: agendaUid,
      },
      0,
      1000,
    )
    .then((r) => r.items.map((ae) => ae.agendaUid));

  log('loadOtherUpdates: remainingAgendaUids: %j', remainingAgendaUids);

  // here you know if it is published somewhere or not
  for (const remainingAgendaUid of remainingAgendaUids) {
    await queue.add('otherUpdate', { agendaUid: remainingAgendaUid, eventUid });
  }
}

export async function otherUpdate(
  services,
  eventSearch,
  { agendaUid, eventUid },
) {
  const { core, tracker } = services;

  log('  otherUpdate', agendaUid, eventUid);

  const { event, member, formSchema, agenda } = await core
    .agendas(agendaUid)
    .events.get(eventUid, {
      returnPayload: true,
      detailed: true,
      access: 'internal',
      load: {
        default: true,
      },
    });

  if (tracker) {
    tracker(`eventSearch.otherUpdate:${agendaUid}.${eventUid}`);
  }

  if (!event) {
    log.warn('    no event was found', { agendaUid, eventUid });
    return;
  }

  await updateAgendaIndex(eventSearch, {
    agenda,
    formSchema,
    member,
    event,
  });

  if (tracker) {
    tracker(`eventSearch.otherUpdate.done:${agendaUid}.${eventUid}`);
  }
}
