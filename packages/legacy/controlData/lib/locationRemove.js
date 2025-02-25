import _ from 'lodash';
import loadControlData from './utils/loadControlData.js';
import refreshTimestamp from './utils/refreshTimestamp.js';

export default async (
  { prefix, knex: _knex, redis, loadedCtlData, skipSave },
  { agendaUid, locationUid },
) => {
  const ctlData = loadedCtlData || await loadControlData(redis, prefix, agendaUid);

  const index = _.findIndex(ctlData.l, { u: locationUid });

  if (index === -1) return;

  ctlData.l.splice(index, 1);

  if (!skipSave) {
    await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

    await refreshTimestamp(prefix, redis, agendaUid);
  }
};
