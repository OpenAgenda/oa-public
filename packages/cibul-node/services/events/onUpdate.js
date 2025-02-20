import logs from '@openagenda/logs';

const log = logs('events/onUpdate');

export default async (services, before, after, context) => {
  log('info', 'updated event %s', after.uid, { context });
};
