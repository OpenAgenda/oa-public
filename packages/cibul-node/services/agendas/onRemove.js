import _ from 'lodash';
import logs from '@openagenda/logs';
import resetCache from './lib/resetCache.js';

const log = logs('services/agendas/onRemove');

let taskRegistered = false;

function registerRemoveMembersTask(services) {
  if (taskRegistered) return;
  taskRegistered = true;

  const { members } = services;

  services.core.tasks.register({
    async removeAgendaMembers({ agendaUid }) {
      const memberStream = members.stream({ agendaUid });
      for await (const member of memberStream) {
        try {
          await members.remove(member.id, { context: { silent: true } });
        } catch (error) {
          log.error('failed to remove member during agenda removal', {
            memberId: member.id,
            agendaUid,
            error,
          });
        }
      }
    },
  });
}

export default async (services, agenda) => {
  const {
    inboxes: { Inbox },
    agendaSearch,
    eventSearch,
    activities,
  } = services;

  const logBundle = {
    agenda: _.pick(agenda, ['uid', 'slug']),
  };

  try {
    await agendaSearch.remove(agenda);
    log.info('removed agenda from search', logBundle);
  } catch (error) {
    log.error('failed to remove agenda from agenda search', {
      ...logBundle,
      error,
    });
  }

  try {
    const { deleted } = await eventSearch.agendas(agenda).clear();
    log.info('removed agenda event documents from index', {
      ...logBundle,
      deleted,
    });
  } catch (error) {
    log.error('failed to agenda events index', { ...logBundle, error });
  }

  try {
    await new Inbox({ type: 'agenda', identifier: agenda.uid }).remove();
    log.info('removed agenda inbox', logBundle);
  } catch (error) {
    log.error('failed to remove agenda inbox', { ...logBundle, error });
  }

  try {
    await activities
      .feed({ entityType: 'agenda', entityUid: agenda.uid })
      .remove();
    log.info('remove agenda feed', logBundle);
  } catch (error) {
    log.error('failed to remove agenda feed', { ...logBundle, error });
  }

  try {
    await resetCache(services, agenda);
  } catch (error) {
    log.error('failed to reset agenda cache', { ...logBundle, error });
  }

  try {
    registerRemoveMembersTask(services);
    await services.core.tasks.enqueue('removeAgendaMembers', {
      agendaUid: agenda.uid,
    });
    log.info('enqueued agenda members removal', logBundle);
  } catch (error) {
    log.error('failed to enqueue agenda members removal', {
      ...logBundle,
      error,
    });
  }
};
