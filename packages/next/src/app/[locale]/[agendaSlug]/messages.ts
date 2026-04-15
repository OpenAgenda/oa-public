import { defineMessages } from 'react-intl';

export default defineMessages({
  totalEvents: {
    id: 'next.views.AgendaShow.totalEvents',
    defaultMessage:
      '{count, plural, =0 {No event} one {1 event} other {# events}}',
  },
  totalUpcomingEvents: {
    id: 'next.views.AgendaShow.totalUpcomingEvents',
    defaultMessage:
      '{count, plural, =0 {No upcoming event} one {1 upcoming event} other {# upcoming events}}',
  },
  showUpcomingEventsOnly: {
    id: 'next.views.AgendaShow.showUpcomingEventsOnly',
    defaultMessage: 'Show upcoming events only',
  },
  includePassedEvents: {
    id: 'next.views.AgendaShow.includePassedEvents',
    defaultMessage: 'Include past events',
  },
  seeMore: {
    id: 'next.views.AgendaShow.seeMore',
    defaultMessage: 'See more',
  },
  filter: {
    id: 'next.views.AgendaShow.filter',
    defaultMessage: 'Filter',
  },
  filters: {
    id: 'next.views.AgendaShow.filters',
    defaultMessage: 'Filters',
  },
  seeEvents: {
    id: 'next.views.AgendaShow.seeEvents',
    defaultMessage: 'Show {count, plural, one {# event} other {# events}}',
  },
  help: {
    id: 'next.views.AgendaShow.help',
    defaultMessage: 'Help',
  },
  termsOfUse: {
    id: 'next.views.AgendaShow.termsOfUse',
    defaultMessage: 'Terms of use',
  },
  networkErrorTitle: {
    id: 'next.views.AgendaShow.networkErrorTitle',
    defaultMessage: 'Connection error',
  },
  networkErrorMessage: {
    id: 'next.views.AgendaShow.networkErrorMessage',
    defaultMessage:
      'Unable to load events. Please check your internet connection and try again.',
  },
  retryButton: {
    id: 'next.views.AgendaShow.retryButton',
    defaultMessage: 'Retry',
  },
  closeButton: {
    id: 'next.views.AgendaShow.closeButton',
    defaultMessage: 'Close',
  },
});
