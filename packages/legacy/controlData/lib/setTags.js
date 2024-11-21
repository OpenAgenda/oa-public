import _ from 'lodash';
import logs from '@openagenda/logs';
import loadControlData from './utils/loadControlData.js';
import refreshTimestamp from './utils/refreshTimestamp.js';
import setTags from './utils/setTags.js';

const log = logs('controlData/settags');

export default async ({ prefix, knex, redis }, agendaUid) => {
  const agendaId = _.get(
    await knex('review').first('id').where('uid', agendaUid),
    'id',
  );

  if (!agendaId) return log('no agenda was found for uid %s', agendaUid);

  const ctlData = await loadControlData(redis, prefix, agendaUid, {
    initialize: true,
  });

  await setTags(ctlData, knex, agendaId);

  await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

  await refreshTimestamp(prefix, redis, agendaUid);
};
