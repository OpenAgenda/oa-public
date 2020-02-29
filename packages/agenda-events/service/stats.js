'use strict';

module.exports.countByUserUid = (service, agendaUid, userUids = null) => {
  const { client } = service;

  const k = client('agenda_event')
    .select(client.raw('count(id) as event_count, user_uid'))
    .where('agenda_uid', agendaUid);

  if (userUids) {
    k.whereIn('user_uid', userUids);
  }

  return k.groupBy('user_uid')
    .then(r => r.map(r => ({
      count: r.event_count,
      userUid: r.user_uid
    })));
}

