import loadControlData from './utils/loadControlData.js';
import refreshTimestamp from './utils/refreshTimestamp.js';
import setLocationReference from './utils/setLocationReference.js';

export default async (
  { prefix, knex: _knex, redis },
  { agendaUid, location },
) => {
  const ctlData = await loadControlData(redis, prefix, agendaUid);

  setLocationReference(ctlData, location);

  await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

  await refreshTimestamp(prefix, redis, agendaUid);
};
