import _ from 'lodash';
import logs from '@openagenda/logs';
import resetCache from './lib/resetCache.js';

const log = logs('services/agendas/onRemove');

export default async (services, agenda) => {
  const {
    inboxes: { Inbox },
    agendaSearch,
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
    // Enqueue the index purge as a retryable task instead of clearing inline:
    // an inline failure here was silently swallowed and left the agenda's events
    // behind as orphans in the index. The processor lives in the worker process
    // (services/agendas/tasks.js, like removeAgendaMembers) — here we only
    // enqueue, with retries so a transient Elasticsearch error is retried.
    // attempts/backoff span a multi-hour window (exponential from 60s) so a
    // long Elasticsearch outage is ridden out rather than permanently orphaning
    // the events; the cleanOrphanEvents script remains the backstop beyond that.
    await services.core.tasks.enqueue(
      'clearAgendaEvents',
      { agendaUid: agenda.uid },
      { attempts: 8, backoff: { type: 'exponential', delay: 60000 } },
    );
    log.info('enqueued agenda event documents removal', logBundle);
  } catch (error) {
    log.error('failed to enqueue agenda events removal', {
      ...logBundle,
      error,
    });
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
    // The processor is registered in the worker process (see
    // services/agendas/tasks.js, wired from task.js) — here we only enqueue.
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
