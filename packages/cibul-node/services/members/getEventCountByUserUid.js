import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/members/getEventCountByUserUid');

export default (services, agendaUid, userUids = []) => {
  const { agendaEvents } = services;

  if (!agendaUid) return [];

  log('processing %d %j', agendaUid, _.uniq(userUids));

  return agendaEvents(agendaUid).stats.countByUserUid(_.uniq(userUids));
};
