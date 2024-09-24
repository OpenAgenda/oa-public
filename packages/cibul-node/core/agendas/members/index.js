import create from './create.js';
import get from './get.js';
import list from './list.js';
import patch from './patch.js';
import remove from './remove.js';
import stream from './stream.js';
import invite from './invite.js';
import sendGroupMail from './sendGroupMail.js';

export default (core, agendaUid) =>
  Object.assign(
    (memberOrUid) => ({
      sendGroupMail: sendGroupMail.bind(null, core, agendaUid, memberOrUid),
    }),
    {
      list: list.bind(null, core, agendaUid),
      get: get.bind(null, core, agendaUid),
      create: create.bind(null, core, agendaUid),
      patch: patch.bind(null, core, agendaUid),
      is: get.is.bind(null, core, agendaUid),
      remove: remove.bind(null, core, agendaUid),
      stream: stream.bind(null, core, agendaUid),
      invite: invite.bind(null, core, agendaUid),
    },
  );
