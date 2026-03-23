import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/members/getEventCountByUserUid');

export default async (services, agendaUid, userUids = []) => {
  const { eventSearch } = services;

  if (!agendaUid) return [];

  const uniqueUids = _.uniq(userUids).filter((uid) => uid != null);

  if (!uniqueUids.length) return [];

  log('processing %d %j', agendaUid, uniqueUids);

  const { search } = eventSearch.agendas({ uid: agendaUid });

  const { aggregations } = await search(
    { memberUid: uniqueUids, state: null },
    { size: 0 },
    { aggregations: [{ type: 'members', size: uniqueUids.length * 2 }] },
  );

  const countsByUid = {};
  for (const bucket of aggregations?.members ?? []) {
    if (uniqueUids.includes(bucket.member.uid)) {
      countsByUid[bucket.member.uid] = (countsByUid[bucket.member.uid] || 0) + bucket.eventCount;
    }
  }

  return Object.entries(countsByUid).map(([uid, count]) => ({
    count,
    userUid: parseInt(uid, 10),
  }));
};
