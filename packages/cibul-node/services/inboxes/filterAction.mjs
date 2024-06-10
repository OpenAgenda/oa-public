export default async function filterAction(services, inbox, conversation, action) {
  const { members: membersSvc } = services;
  if (action.code === 'involveTechnicalSupport') {
    if (inbox.type !== 'agenda') {
      return false;
    }

    const { userUid } = conversation.inboxUser;
    const agendaUid = inbox.identifier;

    const sh = await membersSvc.get({
      userUid,
      agendaUid,
      role: ['moderator', 'administrator'],
    });

    if (!sh) {
      return false;
    }

    return !conversation.inboxes.find(({ type }) => type === 'support');
  }

  if (action.code === 'removeTechnicalSupport') {
    if (conversation.type === 'support') {
      return false;
    }

    if (inbox.type === 'support') {
      return !!conversation.inboxes.find(({ type }) => type === 'support');
    }

    if (inbox.type !== 'agenda') {
      return false;
    }

    const { userUid } = conversation.inboxUser;
    const agendaUid = inbox.identifier;

    const sh = await membersSvc.get({
      userUid,
      agendaUid,
      role: ['moderator', 'administrator'],
    });

    if (!sh) {
      return false;
    }

    return !!conversation.inboxes.find(({ type }) => type === 'support');
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
}
