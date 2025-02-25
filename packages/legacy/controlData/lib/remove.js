import _ from 'lodash';
import logs from '@openagenda/logs';
import loadControlData from './utils/loadControlData.js';
import verifyAndRemoveLocation from './utils/verifyAndRemoveLocation.js';
import refreshTimestamp from './utils/refreshTimestamp.js';

const log = logs('controlData/remove');

export default async ({ prefix, redis }, agendaEvent) => {
  const { eventUid, agendaUid } = agendaEvent;

  const ctlData = await loadControlData(redis, prefix, agendaUid);

  const eventIndex = ctlData ? _.findIndex(ctlData.ev, { u: eventUid }) : -1;

  if (eventIndex === -1) {
    log('warn', 'did not find any ref to remove for %j', agendaEvent);

    return null;
  }

  verifyAndRemoveLocation(ctlData, eventIndex);

  const eventRef = _.first(ctlData.ev.splice(eventIndex, 1));

  await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

  await refreshTimestamp(prefix, redis, agendaUid);

  return eventRef;
};
