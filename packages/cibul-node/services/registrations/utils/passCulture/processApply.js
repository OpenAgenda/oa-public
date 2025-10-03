import logs from '@openagenda/logs';

const log = logs('services/registrations/processPassCultureApply');

export default async function processPassCultureApply(
  { services },
  agenda,
  clean,
  actingMember = null,
  userUid = null,
) {
  log.info('called');

  const { registrations, core, agendaLocations } = services;

  const passCultureService = registrations(
    agenda.settings.registration,
  ).passCulture;

  const { passCulture, event } = clean;

  const location = await agendaLocations.get(event.location.uid, {
    detailed: true,
  });

  const applied = await passCultureService.apply(
    { ...event, location },
    passCulture,
    {
      imageBasePath: core.getConfig().s3.mainBucketPath,
    },
  );

  return event.registration.map((r) =>
    (r.service === 'passCulture'
      ? {
        ...r,
        data: applied,
        value: passCultureService.getEventOfferLink(applied),
        owner: registrations.utils.passCulture.determineOwner(
          actingMember,
          agenda.uid,
          userUid,
        ),
        lastProcessedAt: new Date(),
      }
      : r));
}
