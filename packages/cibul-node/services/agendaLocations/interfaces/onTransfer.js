import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import createLocationFeeds from '../lib/createLocationFeeds.js';

const log = logs('services/agendaLocations/onTransfer');

export default (services) =>
  async (location, sourceAgenda, targetAgenda, context = {}) => {
    const { activities, members } = services;
    const { userUid } = context;

    if (!userUid) {
      log.warn('no userUid in context, not registering activities');
      return;
    }

    // Queue event sync for both source and target agendas
    try {
      // Note: We need to pass both before and after to sync events
      // The location's agendaId has already been updated to target
      const before = {
        ...location,
        agendaId: sourceAgenda.id,
        setUid: sourceAgenda.locationSetUid,
      };
      const after = {
        ...location,
        agendaId: targetAgenda.id,
        setUid: targetAgenda.locationSetUid,
      };

      // Queue sync for impacted events on both agendas
      if (services.queue) {
        services.queue.add('syncImpactedEventsAndAgendas', { before, after });
      }
    } catch (e) {
      log('error', 'failed to queue event sync', e);
    }

    // Register "remove" activity on SOURCE agenda
    try {
      await createLocationFeeds(services, {
        agendaUid: sourceAgenda.uid,
        setUid: sourceAgenda.locationSetUid,
        locationUid: location.uid,
      });

      if (activities) {
        let sourceMember;
        try {
          sourceMember = await members.get(
            { agendaUid: sourceAgenda.uid, userUid },
            { detailed: true },
          );
        } catch (e) {
          const info = {
            agendaUid: sourceAgenda.uid,
            userUid,
          };
          try {
            log.warn(
              Array.isArray(e)
                ? { info: { ...info, errors: e } }
                : new VError({ info, cause: e }),
              'Could not get source member',
            );
          } catch (_) {
            log.info('transfer error', { error: e });
          }
        }

        if (sourceMember) {
          await activities.addActivity(
            { entityType: 'location', entityUid: location.uid },
            {
              actor: `user:${userUid}`,
              verb: 'location.remove',
              object: `location:${location.uid}`,
              target: `agenda:${sourceAgenda.uid}`,
              store: {
                labels: {
                  actor:
                    sourceMember.name
                    ?? sourceMember.custom?.contactName
                    ?? sourceMember.user.fullName,
                  object: location.name || location.title,
                  target: sourceAgenda.title,
                },
                // Mark this as a transfer (not a deletion)
                isTransfer: true,
                transferTargetAgendaUid: targetAgenda.uid,
                transferTargetAgendaName: targetAgenda.title,
              },
            },
          );
        }
      }
    } catch (e) {
      log.error(
        new VError(
          {
            cause: e,
            info: {
              agendaUid: sourceAgenda.uid,
              locationUid: location.uid,
            },
          },
          'Failed to register remove activity on source agenda',
        ),
      );
    }

    // Register "create" activity on TARGET agenda
    try {
      await createLocationFeeds(services, {
        agendaUid: targetAgenda.uid,
        setUid: targetAgenda.locationSetUid,
        locationUid: location.uid,
      });

      if (activities) {
        let targetMember;
        try {
          targetMember = await members.get(
            { agendaUid: targetAgenda.uid, userUid },
            { detailed: true },
          );
        } catch (e) {
          const info = {
            agendaUid: targetAgenda.uid,
            userUid,
          };
          log.warn(
            Array.isArray(e)
              ? { info: { ...info, errors: e } }
              : new VError({ info, cause: e }),
            'Could not get target member',
          );
        }

        if (targetMember) {
          await activities.addActivity(
            { entityType: 'location', entityUid: location.uid },
            {
              actor: `user:${userUid}`,
              verb: 'location.create',
              object: `location:${location.uid}`,
              target: `agenda:${targetAgenda.uid}`,
              store: {
                labels: {
                  actor:
                    targetMember.name
                    ?? targetMember.custom?.contactName
                    ?? targetMember.user.fullName,
                  object: location.name || location.title,
                  target: targetAgenda.title,
                },
                // Mark this as a transfer (not a new creation)
                isTransfer: true,
                transferSourceAgendaUid: sourceAgenda.uid,
                transferSourceAgendaName: sourceAgenda.title,
                setUid: targetAgenda.locationSetUid,
              },
            },
          );
        }
      } else {
        log('activities service is not initialized');
      }
    } catch (e) {
      log.error(
        new VError(
          {
            cause: e,
            info: {
              agendaUid: targetAgenda.uid,
              locationUid: location.uid,
            },
          },
          'Failed to register create activity on target agenda',
        ),
      );
    }
  };
