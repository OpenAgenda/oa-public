import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/agendaLocations/getLinkedAgendas');

export default services => async locationUid => {
  log('getting for %s', locationUid);
  const eventUids = await services.events.list({
    locationUid,
  }, {
    limit: 200,
  }, {
    includeFields: ['uid'],
    access: 'internal',
  }).then(events => events.map(e => e.uid));

  log('retrieved %s linked events', eventUids.length);

  if (!eventUids.length) {
    return [];
  }

  const agendaUids = await services.agendaEvents
    .list.byEventUid(eventUids)
    .then(result => result.items.map(ae => ae.agendaUid));

  const agendaInfos = await services.agendas
    .list({ uid: agendaUids })
    .then(result => result.agendas.map(a => ({ uid: a.uid, title: a.title })));

  const result = _.uniq(agendaInfos);

  return result;
};
