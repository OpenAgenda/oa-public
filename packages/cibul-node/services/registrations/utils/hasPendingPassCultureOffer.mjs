import logs from '@openagenda/logs';

const log = logs('services/registrations/hasPendingPassCultureOffer');

export default function hasPendindPassCultureOffer(event) {
  log('check hasPendingPassCultureOffer', event);
  if (!event.registration) {
    log('hasNoPendindPassCultureOffer', event.uid);
    return false;
  }
  const passCultureRegistration = event.registration.find(r => r.service === 'passCulture');

  if (passCultureRegistration?.data?.warning === 'pending' && passCultureRegistration?.data?.datesPayload) {
    log('hasPendindPassCultureOffer', event.uid);
    return true;
  }
  log('hasNoPendindPassCultureOffer', event.uid);
  return false;
}
