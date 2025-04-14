import logs from '@openagenda/logs';

const log = logs('services/registrations/passCulture/process');

export default async function process({ services }, agenda, clean, options) {
  const { registrations } = services;
  const { draft } = options;

  const hasNewPassOffer = !draft
    && clean.passCulture
    && registrations.utils.passCulture.isNew(clean.passCulture);

  const hasNonPendingPassOfferWithNewItems = !draft
    && clean.passCulture
    && !registrations.utils.passCulture.isMarkedAsPending(clean.passCulture)
    && registrations.utils.passCulture.hasNonApplied(clean.passCulture);

  if (!draft && (hasNewPassOffer || hasNonPendingPassOfferWithNewItems)) {
    log.info('  There is a pass culture payload with event', {
      eventUid: clean.event?.uid,
    });
    if (clean.agendaEvent.state === 2) {
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
  } else if (!draft && clean.passCulture) {
    log.info('  There is no new non-pending pass culture payload', {
      eventUid: clean.event?.uid,
    });
  }
  return false;
}
