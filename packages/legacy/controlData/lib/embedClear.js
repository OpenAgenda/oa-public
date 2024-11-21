import logs from '@openagenda/logs';

const log = logs('controlData/embedClear');

export default ({ prefix, redis }, embedUid) => {
  log('clearing embed %s data', embedUid);

  return redis.del(`${prefix}embeds:${embedUid}`);
};
