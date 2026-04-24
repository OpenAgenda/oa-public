import logs from '@openagenda/logs';
import task from './task.js';
import launchSend from './launchSend.js';

const log = logs('services/members/sendGroupMail');

const queueName = 'memberMessages';

export default function SendGroupMail(config, services) {
  const { bull } = services;

  if (!bull) {
    log.warn(
      'bull service is not initialized. Sending group mail will be deactivated',
    );
  }

  const queue = bull
    ? new bull.Queue(queueName, { prefix: `{${queueName}}` })
    : null;

  let taskHandle = null;

  return Object.assign(
    (agenda, senderMember, query, data, options) =>
      launchSend(queue, agenda, senderMember, query, data, options),
    {
      task: () => {
        taskHandle = task({ config, queue, services });
      },
      clear: () => queue.obliterate(),
      shutdown: async () => {
        await taskHandle?.shutdown();
      },
    },
  );
}
