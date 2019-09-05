'use strict';

const membersSvc = require('../members');

module.exports = async function filterAction(inbox, conversation, action) {

  if (action.code === 'involveTechnicalSupport') {
    if (inbox.type !== 'agenda') {
      return false;
    }

    const { userUid } = conversation.inboxUser;
    const agendaUid = inbox.identifier;

    const sh = await membersSvc.get({
      userUid,
      agendaUid,
      role: ['moderator', 'administrator']
    });

    if (!sh) {
      return false;
    }

    return !conversation.inboxes.find(inbox => inbox.type === 'support');
  }

  if (action.code === 'removeTechnicalSupport') {
    if (conversation.type === 'support') {
      return false;
    }

    if (inbox.type === 'support') {
      return !!conversation.inboxes.find(inbox => inbox.type === 'support');
    }

    if (inbox.type !== 'agenda') {
      return false;
    }

    const { userUid } = conversation.inboxUser;
    const agendaUid = inbox.identifier;

    const sh = await membersSvc.get({
      userUid,
      agendaUid,
      role: ['moderator', 'administrator']
    });

    if (!sh) {
      return false;
    }

    return !!conversation.inboxes.find(inbox => inbox.type === 'support');
  }

  switch (conversation.type) {
    case 'contact_form':
      return inbox.type === 'agenda';
    case 'event':
      return inbox.type === 'agenda';
    case 'request_contribute':
      return inbox.type === 'agenda';
    case 'edition_request':
      return inbox.type === 'user';
    default:
      return true;
  }
};
