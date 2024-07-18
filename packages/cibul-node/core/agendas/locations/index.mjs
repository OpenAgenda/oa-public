import list from './list.mjs';
import get from './get.mjs';
import patch from './patch.mjs';
import remove from './remove.mjs';
import merge from './merge.mjs';
import update from './update.mjs';
import create from './create.mjs';
import getSettings from './getSettings.mjs';

export default (core, agendaOrUid) => (
  {
    create: create(core, agendaOrUid),
    update: update(core, agendaOrUid),
    patch: patch(core, agendaOrUid),
    remove: remove(core, agendaOrUid),
    get: get(core, agendaOrUid),
    list: list(core, agendaOrUid),
    merge: merge(core, agendaOrUid),
    settings: {
      get: getSettings(core, agendaOrUid),
    },
  }
);
