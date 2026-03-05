import list from './list.js';
import get from './get.js';
import patch from './patch.js';
import remove from './remove.js';
import merge from './merge.js';
import update from './update.js';
import transfer from './transfer.js';
import set from './set.js';
import create from './create.js';
import getSettings from './getSettings.js';

export default (core, agendaOrUid) => ({
  create: create(core, agendaOrUid),
  update: update(core, agendaOrUid),
  set: set(core, agendaOrUid),
  patch: patch(core, agendaOrUid),
  remove: remove(core, agendaOrUid),
  get: get(core, agendaOrUid),
  list: list(core, agendaOrUid),
  merge: merge(core, agendaOrUid),
  transfer: transfer(core, agendaOrUid),
  settings: {
    get: getSettings(core, agendaOrUid),
  },
});
