export default (prefix, asyncRedis, agendaUid) =>
  asyncRedis.set(
    `${prefix + agendaUid}:timestamp`,
    JSON.parse(JSON.stringify(new Date())),
  );
