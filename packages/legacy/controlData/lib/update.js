import _ from 'lodash';
import VError from '@openagenda/verror';
import loadControlData from './utils/loadControlData.js';
import loadReviewArticleData from './utils/loadReviewArticleData.js';
import parseEvent from './utils/parseEvent.js';
import refreshTimestamp from './utils/refreshTimestamp.js';
import setLocationReference from './utils/setLocationReference.js';
import updateLastOccurrence from './utils/updateLastOccurrence.js';

export default async (
  { prefix, knex, redis, index, loadedCtlData },
  agendaEvent,
  data,
) => {
  const { eventUid, agendaUid, legacyId } = agendaEvent;

  const ctlData = loadedCtlData || await loadControlData(redis, prefix, agendaUid);

  const eventIndex = index || _.findIndex(ctlData.ev, { u: eventUid });

  if (eventIndex === -1) {
    throw new VError(
      'did not find event %s in ctl data of agenda %s',
      eventUid,
      agendaUid,
    );
  }

  const { c, t, org } = await loadReviewArticleData(knex, legacyId);

  const parsed = { event: parseEvent(data, { c, t, org }) };

  ctlData.ev[eventIndex] = parsed.event;

  if (data.location) {
    parsed.location = setLocationReference(ctlData, data.location);
  }

  updateLastOccurrence(ctlData, data.timings);

  await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

  await refreshTimestamp(prefix, redis, agendaUid);

  return parsed;
};
