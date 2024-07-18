import model from '../model/index.mjs';
import * as legacyEventSvc from '../event/index.mjs';
import cache from '../cache/index.mjs';

export default function instanciate(data) {
  const instance = model.agendas().instance(data);

  function newEvent(cb) {
    const newEventInst = legacyEventSvc.instanciate(instance.events.new());

    if (cb) cb(null, newEventInst);

    return newEventInst;
  }

  const svcInstance = {
    ...instance,
    searchStream: () => { throw new Error('legacy searchStream is no longer available'); },
    resync: () => { throw new Error('resync of legacy search is no longer available'); },
    search: () => { throw new Error('legacy search is no longer available'); },
    aggregate: () => { throw new Error('legacy aggregate search is no longer available'); },
    events: {
      new: newEvent,
      list: instance.events.list,
      get: instance.events.get,
    },
  };

  return cache('agenda', svcInstance, [], ['addEvent', 'removeEvent']);
}
