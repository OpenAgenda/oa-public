import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/agendas/onRemove');

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
};
