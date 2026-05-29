import logs from '@openagenda/logs';
import refreshAgenda from '../../utils/refreshAgenda.js';
import eventLastTimingEnd from '../../utils/eventLastTimingEnd.js';
import sendUpdateEmail from './sendUpdateEmail.js';
import createUpdateActivity from './createUpdateActivity.js';

const log = logs('core/events/eventUpdateSideEffects');

async function processEventUpdateSideEffects(core, data) {
  const {
    eventHasChanged,
    batched,
    event,
    agenda,
    before,
    after,
    userUid,
    formSchema,
    member,
    agendaEvent,
  } = data;

  if (eventHasChanged) {
    await Promise.all([
      sendUpdateEmail(core, { batched, event, agenda }).catch((e) =>
        log('error', 'failed to send update notification email', e)),
      !before.draft
        ? createUpdateActivity(core.services, before, after, {
          userUid,
          agenda,
          formSchema,
          member,
          agendaEvent,
        }).catch((e) => log('error', 'failed to create activity', e))
        : null,
    ]);
  }

  await refreshAgenda(core.services, agenda.uid).catch((e) =>
    log('error', 'failed to refresh agenda', e));

  // Mark the agenda-search doc for refresh, but only if either side of
  // this update touches a bucket inside the current refresh window —
  // min(before.lastTiming.end, after.lastTiming.end). The conditional
  // is enforced server-side by the markRefreshNow script; passing the
  // earlier of the two is the conservative input that triggers
  // whenever either side is in-window.
  const beforeEnd = eventLastTimingEnd(before);
  const afterEnd = eventLastTimingEnd(after);
  const minEnd = beforeEnd && afterEnd
    ? new Date(Math.min(beforeEnd.getTime(), afterEnd.getTime()))
    : beforeEnd || afterEnd;

  await core.services.agendaSearch
    ?.markRefreshNow({ uid: agenda.uid, eventLastTiming: minEnd })
    .catch((e) => log('warn', 'failed to mark agenda for refresh', e));
}

export function register(core) {
  core.tasks.register({
    eventUpdateSideEffects: (data) => processEventUpdateSideEffects(core, data),
  });
}
