import { produce } from 'immer';
import logs from '@openagenda/logs';

const log = logs('services/registrations/createPassCultureOffer');

export default async function createPassCultureOffer(
  services,
  agenda,
  clean,
  before,
) {
  log.info('called');

  const { registrations } = services;

  const { passCulture } = clean;

  const passCultureService = registrations(
    agenda.settings.registration,
  ).passCulture;

  const {
    eventOffer,
    errors,
    warning = null,
    datesPayload = null,
  } = await passCultureService.createEventOffer(clean.event, passCulture, {
    before,
  });

  log.info('createEventOffer result', {
    eventOffer,
    errors,
    warning,
    datesPayload,
    uid: before?.uid,
    agendaUid: agenda.uid,
  });

  registrations.utils.passCulture.checkPendingAndQueue(
    registrations,
    before,
    agenda,
  );

  return produce(clean.event.registration, (draft) => {
    const item = draft.find((r) => r.service === 'passCulture');

    item.data.id = eventOffer.id;
    item.value = passCultureService.getEventOfferLink(eventOffer);
    item.data.warning = warning;
    item.data.datesPayload = datesPayload;
    if (errors) {
      item.data.errors = errors;
    }
  });
}
