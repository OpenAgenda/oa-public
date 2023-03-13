import { defineMessages } from 'react-intl';

export default defineMessages({
  totalEvents: {
    id: 'next.views.AgendaShow.totalEvents',
    defaultMessage: '{count, plural, =0 {No event} one {1 event} other {# events}}',
  },
  totalUpcomingEvents: {
    id: 'next.views.AgendaShow.totalUpcomingEvents',
    defaultMessage: '{count, plural, =0 {No upcoming event} one {1 upcoming event} other {# upcoming events}}',
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
    defaultMessage: 'Show the {count} events',
  },
  help: {
    id: 'next.views.AgendaShow.help',
    defaultMessage: 'Help',
  },
  termsOfUse: {
    id: 'next.views.AgendaShow.termsOfUse',
    defaultMessage: 'Terms of use',
  },
});
