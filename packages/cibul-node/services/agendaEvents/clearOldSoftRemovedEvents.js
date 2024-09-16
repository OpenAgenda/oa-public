import logs from '@openagenda/logs';

const log = logs('clearOldSoftRemoved');

// This script is used to clear old soft removed events from agenda-events in the database.
export default async (services, options = {}) => {
  const { agendaEvents, eventSearch } = services;

  const { dateSince } = {
    dateSince: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    ...options,
  };

  const { items, total } = await agendaEvents.list.removed(
    { updatedAt: { lt: dateSince } },
    0,
    1000,
  );

  if (total === 0) {
    log('info', 'no events to hard remove');
    return;
  }

  const agendasUid = items.reduce((ag, event) => {
    if (!ag.find((a) => a === event.agendaUid)) {
      ag.push(event.agendaUid);
    }
    return ag;
  }, []);

  for (const item of items) {
    try {
      await agendaEvents(item.agendaUid).remove(item.eventUid, { soft: false });
    } catch (error) {
      log('error', 'could not remove event', item.uid, error);
    }
  }

  for (const agendaUid of agendasUid) {
    try {
      await eventSearch.agendas({ uid: agendaUid }).rebuild();
    } catch (error) {
      log('error', 'could not rebuild search index', agendaUid, error);
    }
  }
};
