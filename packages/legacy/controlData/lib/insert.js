import loadControlData from './utils/loadControlData.js';
import loadReviewArticleData from './utils/loadReviewArticleData.js';
import updateLastOccurrence from './utils/updateLastOccurrence.js';
import parseEvent from './utils/parseEvent.js';
import refreshTimestamp from './utils/refreshTimestamp.js';
import setLocationReference from './utils/setLocationReference.js';

export default async (
  { prefix, knex, redis, loadedCtlData, skipSave },
  agendaEvent,
  data,
) => {
  const { agendaUid, legacyId } = agendaEvent;

  const ctlData = loadedCtlData || await loadControlData(redis, prefix, agendaUid);

  const { c, t, org } = await loadReviewArticleData(knex, legacyId);

  const parsed = { event: parseEvent(data, { c, t, org }) };

  ctlData.ev.push(parsed.event);

  if (data.location) {
    parsed.location = setLocationReference(ctlData, data.location);
  }

  updateLastOccurrence(ctlData, data.timings);

  if (!skipSave) {
    await redis.set(prefix + agendaUid, JSON.stringify(ctlData));

    await refreshTimestamp(prefix, redis, agendaUid);
  }

  return parsed;
};
