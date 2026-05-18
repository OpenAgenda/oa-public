import logs from '@openagenda/logs';

const log = logs('core/agendas/events/transferOwnership');

export default async function transferOwnership(
  core,
  agendaUid,
  eventUid,
  data,
  options = {},
) {
  log('not implemented yet', { agendaUid, eventUid, data, options });
  throw new Error('not implemented');
}
