'use strict';

module.exports = async (service, agendaUid, since = null) => {
  const { client } = service;

  return client('agenda_event').count('id', { as: 'count' })
    .where({
      aggregated: true,
      agenda_uid: agendaUid
    })
    .where('created_at', '>', _cleanSince(since))
    .then(r => r.length ? r[0].count : 0);
}

function _cleanSince(since) {
  if (since) {
    return new Date(since);
  }

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  return oneYearAgo;
}
