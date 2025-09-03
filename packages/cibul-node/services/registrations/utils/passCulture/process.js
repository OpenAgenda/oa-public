import logs from '@openagenda/logs';

const log = logs('services/registrations/passCulture/process');

export function getLastDescription(clean) {
  const passCulture = clean?.passCulture;

  if (!passCulture || !Array.isArray(passCulture)) {
    return null;
  }

  let lastDescription = null;
  for (const item of passCulture) {
    if (item?.description !== undefined) {
      lastDescription = item.description;
    }
  }

  return lastDescription;
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return obj1 === obj2;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  if (
    Object.prototype.hasOwnProperty.call(obj1, 'fr')
    && Object.prototype.hasOwnProperty.call(obj2, 'fr')
  ) {
    return deepEqual(obj1.fr, obj2.fr);
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export function compareEventFields(clean, event) {
  const lastDescription = getLastDescription(clean);

  if (!deepEqual(clean?.event?.title, event?.title)) {
    return true;
  }

  if (
    !deepEqual(clean?.event?.longDescription, event?.longDescription)
    && lastDescription === 'linked desc'
  ) {
    return true;
  }
  return false;
}

export default async function process(
  { services },
  agenda,
  clean,
  event,
  agendaEventOldState,
) {
  const { registrations } = services;

  const hasNewPassOffer = clean.passCulture
    && registrations.utils.passCulture.isNew(clean.passCulture);

  const hasNonPendingPassOfferWithNewItems = clean.passCulture
    && !registrations.utils.passCulture.isMarkedAsPending(clean.passCulture)
    && registrations.utils.passCulture.hasNonApplied(clean.passCulture);

  const changedOaFields = compareEventFields(clean, event);

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
  } else if (
    changedOaFields
    && clean.passCulture
    && (clean.agendaEvent.state
      ? clean.agendaEvent.state === 2
      : agendaEventOldState === 2)
  ) {
    // Add editing flags to passCulture array
    const updatedClean = {
      ...clean,
      passCulture: [
        ...clean.passCulture,
        { editing: true, updateEventOffer: true },
      ],
    };

    try {
      return await registrations.utils.passCulture.processApply(
        agenda,
        updatedClean,
      );
    } catch (e) {
      log('error', e);
      throw e;
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
          passCulture: passData.concat({
            editing: true,
            updateEventOffer: true,
          }),
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
