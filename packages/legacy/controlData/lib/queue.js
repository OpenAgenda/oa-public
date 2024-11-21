import logs from '@openagenda/logs';

const log = logs('legacy/controlData/queue');

export default ({ redis, prefix }, operation, args = []) => {
  log('queueing %s', operation);

  return redis.rPush(
    `${prefix}queue`,
    JSON.stringify({
      operation,
      args,
    }),
  );
};
