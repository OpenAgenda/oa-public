import logs from '@openagenda/logs';
// One-off orphan-event cleanup, exposed so it can run inside the tasks process
// instead of the standalone `yarn clean-orphan-events` script. Kept as a
// commented import + call below (see registerAgendaTasks) — enable only when the
// migration prerequisites are met.
// import { cleanOrphanEvents } from '../../scripts/cleanOrphanEvents.js';

const log = logs('services/agendas/tasks');

// Registers the `core` queue processors owned by the agendas service.
//
// This MUST run in the process that starts the `core` worker (the aggregation
// task process — see task.js), NOT lazily from onRemove: onRemove runs in the
// api/web process where the agenda is deleted, which only enqueues the job. If
// the processor is only registered there, the worker process never knows how to
// handle `removeAgendaMembers` and silently drops it as an "Unknown job",
// leaving orphan member rows behind.
export default function registerAgendaTasks(services) {
  const { members, eventSearch } = services;

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

    // Purge the deleted agenda's event documents from the search index. Run as
    // a retryable task (enqueued from onRemove) rather than inline: a transient
    // Elasticsearch failure must NOT be swallowed, otherwise the agenda's events
    // are left behind as orphans forever (a global reindex only walks live
    // agendas). Letting the error propagate lets the queue retry the job.
    async clearAgendaEvents({ agendaUid }) {
      try {
        const { deleted } = await eventSearch
          .agendas({ uid: agendaUid })
          .clear();
        log.info('cleared agenda event documents from index', {
          agendaUid,
          deleted,
        });
      } catch (error) {
        // A missing index means there is nothing to purge — not a transient
        // failure, so swallow it (retrying would never succeed). Any other
        // error propagates so the queue retries the job.
        if (error?.meta?.body?.error?.type === 'index_not_found_exception') {
          // Anomalous in production (the agenda-events index always exists), so
          // warn rather than info: if it ever fires outside a fresh/test env it
          // points at an index recreate/restore window worth investigating.
          log.warn('no index to clear for agenda', { agendaUid });
          return;
        }
        throw error;
      }
    },
  });

  // One-off purge of orphan event documents (events of agendas deleted before
  // deletion-time purge existed). Left commented on purpose: enable ONLY AFTER
  // the events_live migration has shipped and the phantom indices are dropped
  // (full sequence in scripts/cleanOrphanEvents.js). To run it, uncomment the
  // import at the top of this file and the call below, deploy the tasks process
  // once so it runs at boot (APPLY mode), then re-comment. Until then, use the
  // standalone `yarn clean-orphan-events` script.
  // cleanOrphanEvents({ services, apply: true }).catch((error) => {
  //   log.error('orphan-event cleanup failed', { error });
  // });
}
