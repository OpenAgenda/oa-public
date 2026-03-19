import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/members/getEventCountByUserUid');

export default async (services, agendaUid, userUids = []) => {
  const { eventSearch } = services;

  if (!agendaUid) return [];

  const uniqueUids = _.uniq(userUids);

  if (!uniqueUids.length) return [];

  log('processing %d %j', agendaUid, uniqueUids);

  const { search } = eventSearch.agendas({ uid: agendaUid });

  const { aggregations } = await search(
    {},
    { size: 0 },
    { aggregations: ['members'] },
  );

  return (aggregations?.members ?? [])
    .filter((bucket) => uniqueUids.includes(bucket.member.uid))
    .map((bucket) => ({
      count: bucket.eventCount,
      userUid: bucket.member.uid,
    }));
};
