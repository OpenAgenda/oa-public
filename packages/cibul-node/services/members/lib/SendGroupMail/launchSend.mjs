import _ from 'lodash';
import logs from '@openagenda/logs';
import { Forbidden } from '@openagenda/verror';

const log = logs('services/members/sendGroupMail/launchSend');

export default function launchSend(
  queue,
  agenda,
  senderMember,
  query,
  data,
  options = {},
) {
  if (!queue) {
    log.warn('queue was not initialized, aborting');
    return;
  }

  if (!agenda.credentials.invitationMessage) {
    throw new Forbidden('This feature is not available on this agenda');
  }

  log.info('launching', { agendaUid: agenda.uid, query, data });

  queue.add('sendMessageChain', {
    senderMember,
    query: { agendaUid: agenda.uid, ...query ?? {} },
    data,
    agenda: _.pick(agenda, ['uid', 'slug', 'title', 'image']),
    options,
  });
}
