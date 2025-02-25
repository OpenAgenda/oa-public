import _ from 'lodash';
import insert from './insert.js';
import update from './update.js';
import loadControlData from './utils/loadControlData.js';

export default async ({ prefix, knex, redis }, agendaEvent, data) => {
  const { eventUid, agendaUid } = agendaEvent;

  const ctlData = await loadControlData(redis, prefix, agendaUid, {
    parse: true,
    initialize: true,
  });

  const eventIndex = _.findIndex(ctlData.ev, { u: eventUid });

  if (eventIndex === -1) {
    return insert(
      { prefix, knex, redis, loadedCtlData: ctlData },
      agendaEvent,
      data,
    );
  }

  return update(
    { prefix, knex, redis, loadedCtlData: ctlData, index: eventIndex },
    agendaEvent,
    data,
  );
};
