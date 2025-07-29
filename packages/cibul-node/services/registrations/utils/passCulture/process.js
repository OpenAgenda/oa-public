import logs from '@openagenda/logs';

const log = logs('services/registrations/passCulture/process');

export default async function process(
  { services },
  agenda,
  clean,
  agendaEventOldState,
) {
  const { registrations } = services;

  const hasNewPassOffer = clean.passCulture
    && registrations.utils.passCulture.isNew(clean.passCulture);

  const hasNonPendingPassOfferWithNewItems = clean.passCulture
    && !registrations.utils.passCulture.isMarkedAsPending(clean.passCulture)
    && registrations.utils.passCulture.hasNonApplied(clean.passCulture);

  if (hasNewPassOffer || hasNonPendingPassOfferWithNewItems) {
    log.info('  There is a pass culture payload with event', {
      eventUid: clean.event?.uid,
    });
    if (
      clean.agendaEvent.state
        ? clean.agendaEvent.state === 2
        : agendaEventOldState === 2
    ) {
      try {
        return await registrations.utils.passCulture.processApply(
          agenda,
          clean,
        );
      } catch (e) {
        log('error', e);
        throw e;
      }
    } else {
      const passCultureService = registrations(
        agenda.settings.registration,
      ).passCulture;
      try {
        await passCultureService.validate(clean.event, clean.passCulture);
      } catch (error) {
        log('error', error);
        throw error;
      }
    }
  } else if (clean.passCulture) {
    log.info('  There is no new non-pending pass culture payload', {
      eventUid: clean.event?.uid,
    });
  }
  return false;
}

export async function loadAndProcess({ services }, agendaUid, eventUid) {
  const { agendas, events, agendaEvents } = services;

  // get event first to check if it belongs to the requested agenda
  const event = await events.get(eventUid, {
    access: 'internal',
    detailed: true,
  });

  // Only process if the event belongs to the requested agenda (filter other agendas)
  if (agendaUid !== event.agenda.uid) return;

  // get Agenda and check pass settings
  const agenda = await agendas.get(
    { uid: agendaUid },
    {
      internal: true,
      private: null,
    },
  );

  if (!agenda?.settings?.registration?.passCulture) return;

  // get agendaEvent - needed for clean.agendaEvent.state check in process function
  const agendaEvent = await agendaEvents(agendaUid).get(eventUid, {
    throwOnNotFound: true,
  });

  const passData = event.registration.find(
    (r) => r.service === 'passCulture',
  ).data;

  if (passData) {
    try {
      const updatedRegistration = await process(
        { services },
        agenda,
        {
          event,
          passCulture: passData.concat({ editing: true, updateAddress: true }),
          agendaEvent,
        },
        null,
        true,
      );
      if (updatedRegistration) {
        await events.patch(eventUid, { registration: updatedRegistration });
      }
    } catch (error) {
      log.error('Error in passCulture loadAndProcess:', error);
    }
  }
}
