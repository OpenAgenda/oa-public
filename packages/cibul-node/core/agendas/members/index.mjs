import create from './create.mjs';
import get from './get.mjs';
import list from './list.mjs';
import patch from './patch.mjs';
import remove from './remove.mjs';
import stream from './stream.mjs';
import sendGroupMail from './sendGroupMail.mjs';

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
