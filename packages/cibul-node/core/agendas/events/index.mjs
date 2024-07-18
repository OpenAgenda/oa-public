import add from './add.mjs';
import Batch from './batch.mjs';
import get from './get.mjs';
import * as search from './search.mjs';
import list from './list.mjs';
import create from './create.mjs';
import remove from './remove.mjs';
import update from './update.mjs';
import references from './references.mjs';
import validate, { eventFields as validateEventFields } from './validate.mjs';

export default core => {
  const batch = Batch(core);
  const resyncEvents = search.resyncEvents(core);

  return agendaUid => ({
    get: get.bind(null, core, agendaUid),
    list: list.bind(null, core, agendaUid),
    create: create.bind(null, core, agendaUid),
    add: add.bind(null, core, agendaUid),
    remove: remove.bind(null, core, agendaUid),
    update: update.bind(null, core, agendaUid),
    patch: update.patch.bind(null, core, agendaUid),
    references: references.bind(null, core, agendaUid),
    validate: Object.assign(
      validate.bind(null, core, agendaUid),
      { eventFields: validateEventFields },
    ),
    batch: batch.bind(null, agendaUid),
    search: Object.assign(search.default.bind(null, core, agendaUid), {
      rebuild: search.rebuild.bind(null, core, agendaUid),
      resyncEvent: search.resyncEvent.bind(null, core, agendaUid),
      resyncEvents: resyncEvents.bind(null, agendaUid),
      get: search.get.bind(null, core, agendaUid),
    }),
  });
};
