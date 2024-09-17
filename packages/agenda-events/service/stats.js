export function countByUserUid(service, agendaUid, userUids = null) {
  const { client } = service;

  const k = client('agenda_event')
    .select(client.raw('count(id) as event_count, user_uid'))
    .where('agenda_uid', agendaUid)
    .where('removed', 0);

  if (userUids) {
    k.whereIn('user_uid', userUids);
  }

  return k.groupBy('user_uid').then((r) =>
    r.map((rr) => ({
      count: rr.event_count,
      userUid: rr.user_uid,
    })));
}
