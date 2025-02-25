import logs from '@openagenda/logs';
import buildEmbedControlData from './buildEmbedControlData.js';

const log = logs('controlData/loadEmbedControlData');

export default async ({ prefix, knex, redis, imagePath }, embedUid) => {
  const ctlDataStr = await redis.get(`${prefix}embeds:${embedUid}`);

  if (ctlDataStr) {
    log('providing embed %s stored data', embedUid);

    return ctlDataStr;
  }

  log('building embed %s data', embedUid);

  const embedControlData = await buildEmbedControlData(
    { knex, imagePath },
    embedUid,
  );

  const stringified = JSON.stringify(embedControlData);

  await redis.set(`${prefix}embeds:${embedUid}`, stringified);

  return stringified;
};
