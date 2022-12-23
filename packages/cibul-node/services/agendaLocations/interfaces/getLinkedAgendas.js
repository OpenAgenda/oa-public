'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaLocations/getLinkedAgendas');

module.exports = services => async locationUid => {
  log('getting for %s', locationUid);
  const eventUids = await services.events.list({
    locationUid,
  }, {
    limit: 200,
  }, {
    includeFields: ['uid'],
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
