import _ from 'lodash';
import loadControlData from './utils/loadControlData.js';
import refreshTimestamp from './utils/refreshTimestamp.js';
import roles from './utils/roles.js';

export default async (
  { prefix, knex: _knex, redis, loadedCtlData, skipSave },
  { agendaUid, userUid },
) => {
  const ctlData = loadedCtlData || await loadControlData(redis, prefix, agendaUid);

  _.keys(roles)
    .map((k) => roles[k])
    .forEach((roleCtlKey) => {
      const index = _.get(ctlData, roleCtlKey, []).indexOf(userUid);

      if (index !== -1) ctlData[roleCtlKey].splice(index, 1);
    });

  if (!skipSave) {
    await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

    await refreshTimestamp(prefix, redis, agendaUid);
  }
};
