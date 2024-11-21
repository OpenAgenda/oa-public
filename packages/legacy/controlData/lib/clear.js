export default ({ prefix, redis }, agendaUid) => redis.del(prefix + agendaUid);
