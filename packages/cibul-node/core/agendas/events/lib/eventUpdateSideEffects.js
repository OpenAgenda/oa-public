import logs from '@openagenda/logs';
import refreshAgenda from '../../utils/refreshAgenda.js';
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
}

export function register(core) {
  core.tasks.register({
    eventUpdateSideEffects: (data) => processEventUpdateSideEffects(core, data),
  });
}
