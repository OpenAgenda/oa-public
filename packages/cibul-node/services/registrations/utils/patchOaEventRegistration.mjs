import logs from '@openagenda/logs';

const log = logs('services/registrations/patchOaEventRegistration');

export default async function patchOaEventRegistration(services, agendaUid, eventUid, dates) {
  const { core } = services;
  log('patchOaEventRegistration called', { agendaUid, eventUid, dates });
  if (!dates) {
    log('nothing to patch, no dates provided');
    return false;
  }
  const event = await core.agendas(agendaUid).events.get(eventUid, {});
  const { registration } = event;
  const newRegistration = registration.map(r => {
    if (r.service === 'passCulture') {
      return {
        ...r,
        data: {
          ...r.data,
          warning: null,
          datesPayload: null,
          dates,
        },
      };
    }
    return r;
  });
  try {
    await core.agendas(agendaUid).events.patch(eventUid, { registration: newRegistration }, { access: 'internal' });
    log('patchOaEventRegistration success', { agendaUid, eventUid, dates });
    return true;
  } catch (e) {
    log.error('patchOaEventRegistration failed', e);
    return false;
  }
}
