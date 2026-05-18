import add from './add.js';
import Batch from './batch.js';
import get from './get.js';
import * as search from './search.js';
import list from './list.js';
import create from './create.js';
import remove from './remove.js';
import update from './update.js';
import setByExtId from './setByExtId.js';
import removeByExtId from './removeByExtId.js';
import references from './references.js';
import conversations from './conversations.js';
import validate, { eventFields as validateEventFields } from './validate.js';
import { register as registerUpdateSideEffects } from './lib/eventUpdateSideEffects.js';
import transferOwnership from './transferOwnership.js';

export default (core) => {
  const batch = Batch(core);
  const resyncEvents = search.resyncEvents(core);
  registerUpdateSideEffects(core);

  return (agendaUid) =>
    Object.assign(
      (eventUid) => ({
        conversations: conversations(core, agendaUid, eventUid),
      }),
      {
        get: get.bind(null, core, agendaUid),
        list: list.bind(null, core, agendaUid),
        create: create.bind(null, core, agendaUid),
        add: add.bind(null, core, agendaUid),
        remove: remove.bind(null, core, agendaUid),
        update: update.bind(null, core, agendaUid),
        patch: update.patch.bind(null, core, agendaUid),
        transferOwnership: transferOwnership.bind(null, core, agendaUid),
        references: references.bind(null, core, agendaUid),
        setByExtId: setByExtId.bind(null, core, agendaUid),
        removeByExtId: removeByExtId.bind(null, core, agendaUid),
        validate: Object.assign(validate.bind(null, core, agendaUid), {
          eventFields: validateEventFields,
        }),
        batch: batch.bind(null, agendaUid),
        search: Object.assign(search.default.bind(null, core, agendaUid), {
          rebuild: search.rebuild.bind(null, core, agendaUid),
          resyncEvent: search.resyncEvent.bind(null, core, agendaUid),
          resyncEvents: resyncEvents.bind(null, agendaUid),
          get: search.get.bind(null, core, agendaUid),
        }),
      },
    );
};
