import logs from '@openagenda/logs';

const log = logs('events/interfaces/onRemove');

export default async (services, event, context) => {
  log('info', 'removed event %s', event.uid, { context });
  services.tracker(`events.onRemove.${event.uid}`);
};
