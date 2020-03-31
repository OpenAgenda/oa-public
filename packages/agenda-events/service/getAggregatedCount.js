'use strict';

const CachedCount = require('./lib/CachedCount');

module.exports = service => {
  const {
    client,
    redisClient
  } = service;

  const fn = getAggregatedCount.bind(null, service);
  const cached = redisClient ? CachedCount(redisClient, 'getAggregatedCount', fn) : null;

  return Object.assign((agendaUid, since = null) => (cached || fn)(agendaUid, since), {
    inc: (agendaUid, count = 1) => {
      if (!cached) return;
      return cached.inc(agendaUid, count);
    },
    dec: (agendaUid, count = 1) => {
      if (!cached) return;
      return cached.dec(agendaUid, count);
    }
  });
}

async function getAggregatedCount(service, agendaUid, since = null) {
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
