import Queues from '@openagenda/queues';

export function init(config, { redis }) {
  const logger = config.getLogConfig('svc', 'queues');

  return Queues({
    logger,
    redis,
    prefix: config.queuesPrefix ?? 'q:',
  });
}
