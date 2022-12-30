import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  sharedFrom: {
    id: 'EventAdminApp.EventItem.sharedFrom',
    defaultMessage: 'Shared from <agendaLink>{agendaTitle}</agendaLink>',
  },
  sharedFromBy: {
    id: 'EventAdminApp.EventItem.sharedFromBy',
    defaultMessage:
      'Shared from <agendaLink>{agendaTitle}</agendaLink> by <memberLink>{memberName}</memberLink>',
  },
  sharedBy: {
    id: 'EventAdminApp.EventItem.sharedBy',
    defaultMessage: 'Shared by <memberLink>{memberName}</memberLink>',
  },
  shared: {
    id: 'EventAdminApp.EventItem.shared',
    defaultMessage: 'Shared',
  },
});

export default function EventItem({ event, agenda, memberPlaceholderMsg }) {
  const m = useIntl().formatMessage;

  const messageData = {
    agendaLink: event.originAgenda
      ? chunks => <a href={`/agendas/${event.originAgenda.uid}`}>{chunks}</a>
      : null,
    memberLink: event.member
      ? chunks => (
        <a href={`/${agenda.slug}/admin/members?userUid=${event.member.uid}`}>
          {chunks}
        </a>
      )
      : null,
    agendaTitle: event.originAgenda?.title,
    memberName: memberPlaceholderMsg(event.member),
  };

  if (event.originAgenda && event.member) {
    return m(messages.sharedFromBy, messageData);
  }

  if (event.originAgenda && !event.member) {
    return m(messages.sharedFrom, messageData);
  }

  if (event.member?.name) {
    return m(messages.sharedBy, messageData);
  }

  return m(messages.shared, messageData);
}
