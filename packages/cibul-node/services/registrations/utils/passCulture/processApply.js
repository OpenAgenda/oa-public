import logs from '@openagenda/logs';

const log = logs('services/registrations/processPassCultureApply');

export default async function processPassCultureApply(
  { services },
  agenda,
  clean,
) {
  log.info('called');

  const { registrations, core } = services;

  const passCultureService = registrations(
    agenda.settings.registration,
  ).passCulture;

  const { passCulture, event } = clean;

  const applied = await passCultureService.apply(event, passCulture, {
    imageBasePath: core.getConfig().aws.imageBucketPath,
  });

  return event.registration.map(r =>
    (r.service === 'passCulture'
      ? {
        ...r,
        data: applied,
        value: passCultureService.getEventOfferLink(applied),
        lastProcessedAt: new Date(),
      }
      : r));
}
