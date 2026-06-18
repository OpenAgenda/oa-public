import logs from '@openagenda/logs';

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
