export default function checkPendingAndQueue({ registrations }, event, agenda) {
  if (!registrations || !event || !agenda) {
    return false;
  }
  registrations.utils.passCulture.hasPendingOffer(event);
  const passCultureRegistration = event.registration.find(r => r.service === 'passCulture');
  registrations.utils.passCulture.enqueueProcessPendingOffer(
    { eventOfferId: passCultureRegistration.data.id, datesPayload: passCultureRegistration.data.datesPayload },
    { eventUid: event.uid, agendaUid: agenda.uid },
    agenda.settings.registration,
  );
}
