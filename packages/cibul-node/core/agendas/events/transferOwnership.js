import { NotFound } from '@openagenda/verror';
import logs from '@openagenda/logs';
import getAgenda from '../utils/getAgenda.js';

const log = logs('core/agendas/events/transferOwnership');

export default async function transferOwnership(
  core,
  agendaUid,
  eventUid,
  data,
  options = {},
) {
  const { events } = core.services;

  log('transferring event %s on agenda %s', eventUid, agendaUid);

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  const event = await events.get(eventUid, {
    access: 'internal',
    private: null,
  });

  if (!event) {
    throw new NotFound({ info: { uid: eventUid } }, 'event not found');
  }

  log('after checks', { agenda: agenda?.uid, data, options });

  throw new Error('not implemented');
}
