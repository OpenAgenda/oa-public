import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'next.views.AgendaShow.AggregateModal.title',
    defaultMessage: 'Aggregate to an agenda',
  },
  subtitle: {
    id: 'next.views.AgendaShow.AggregateModal.subtitle',
    defaultMessage:
      'Events published by {agenda} will be automatically added to the selected agenda.',
  },
  signedIn: {
    id: 'next.views.AgendaShow.AggregateModal.signedIn',
    defaultMessage: 'Signed in.',
  },
  noAgenda: {
    id: 'next.views.AgendaShow.AggregateModal.noAgenda',
    defaultMessage:
      'Warning: You are not currently administering any agenda. You need to create one before you can aggregate {agenda}.',
  },
  createAgenda: {
    id: 'next.views.AgendaShow.AggregateModal.createAgenda',
    defaultMessage: 'Create an agenda',
  },
});
