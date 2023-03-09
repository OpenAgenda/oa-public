import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'next.views.AgendaShow.AggregateModal.title',
    defaultMessage: 'Aggregate to an agenda',
  },
  subtitle: {
    id: 'next.views.AgendaShow.AggregateModal.subtitle',
    defaultMessage: 'Events published by {agenda} will be automatically added to the selected calendar.',
  },
  shouldConnect: {
    id: 'next.views.AgendaShow.AggregateModal.shouldConnect',
    defaultMessage: 'You need to sign in to your account to aggregate this agenda.',
  },
  signin: {
    id: 'next.views.AgendaShow.AggregateModal.signin',
    defaultMessage: 'Sign in',
  },
  noAgenda: {
    id: 'next.views.AgendaShow.AggregateModal.noAgenda',
    defaultMessage: 'Warning: You are not currently administering any agenda. You need to create one before you can aggregate {agenda}.',
  },
  createAgenda: {
    id: 'next.views.AgendaShow.AggregateModal.createAgenda',
    defaultMessage: 'Create an agenda',
  },
});
