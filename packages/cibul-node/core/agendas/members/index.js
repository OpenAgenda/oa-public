import create from './create.js';
import get from './get.js';
import list from './list.js';
import patch from './patch.js';
import remove from './remove.js';
import stream from './stream.js';
import sendGroupMail from './sendGroupMail.js';

const invite = (core, agendaUid, { role, emails = [], context }) => {
  const { members } = core.services;
  return members.set.byEmail.bulk({
    agendaUid,
    role,
  }, emails, {
    requireCustom: false,
    context,
  });
};

export default (core, agendaUid) => Object.assign(memberOrUid => ({
  sendGroupMail: sendGroupMail.bind(null, core, agendaUid, memberOrUid),
}), {
  list: list.bind(null, core, agendaUid),
  get: get.bind(null, core, agendaUid),
  create: create.bind(null, core, agendaUid),
  patch: patch.bind(null, core, agendaUid),
  is: get.is.bind(null, core, agendaUid),
  remove: remove.bind(null, core, agendaUid),
  stream: stream.bind(null, core, agendaUid),
  invite: invite.bind(null, core, agendaUid),
});
