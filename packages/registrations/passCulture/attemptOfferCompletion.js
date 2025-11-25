import logs from '@openagenda/logs';
import formatErrors from './lib/formatErrors.js';

const log = logs('passCulture/attemptOfferCompletion');

export default async function attemptOfferCompletion(
  { pc, interfaces },
  { eventOfferId, datesPayload },
  { eventUid, agendaUid },
  options = {},
) {
  const { simulatePending = false } = options;

  let dates = null;
  const offer = await pc.offers.events(eventOfferId).get();
  log.info('offer status', { status: offer.status, id: eventOfferId });

  if (interfaces?.checkEvent) {
    const resp = await interfaces.checkEvent(agendaUid, eventUid);
    if (resp === false) {
      log.error('OA event is no longer available');
      return false;
    }
  }

  if (simulatePending || offer.status === 'PENDING') {
    log.error('offer status is still pending', { status: offer.status });
    return false;
  }
  // all good attempt dates creation
  try {
    const { dates: createdDates } = await pc.offers
      .events(eventOfferId)
      .dates.create({
        dates: datesPayload,
      });
    dates = createdDates;

    log('%s: created %s dates', eventOfferId, createdDates.length);

    if (interfaces?.patchOaEventRegistration) {
      const wasPatch = await interfaces.patchOaEventRegistration(
        agendaUid,
        eventUid,
        dates,
      );
      log('patched event registration', { wasPatch });
    }
    return true;
  } catch (e) {
    log.error('failed to create dates', e);
    return {
      dates,
      errors: formatErrors(await e.response.json()),
    };
  }
}
