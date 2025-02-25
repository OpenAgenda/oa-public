import _ from 'lodash';
import loadControlData from './utils/loadControlData.js';
import memberRemove from './memberRemove.js';
import refreshTimestamp from './utils/refreshTimestamp.js';
import roles from './utils/roles.js';

export default async (
  { prefix, knex, redis },
  { agendaUid, userUid, role },
) => {
  const ctlData = await loadControlData(redis, prefix, agendaUid);

  await memberRemove(
    { prefix, knex, redis, loadedCtlData: ctlData, skipSave: true },
    { agendaUid, userUid },
  );

  _.set(ctlData, roles[role], _.get(ctlData, roles[role], []).concat(userUid));

  await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

  await refreshTimestamp(prefix, redis, agendaUid);
};
