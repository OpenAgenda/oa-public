import { defineMessages } from 'react-intl/server';

export default defineMessages({
  pageTitle: {
    id: 'next.views.AgendaSearch.pageTitle',
    defaultMessage: 'Agendas search',
  },
  seeMore: {
    id: 'next.views.AgendaSearch.seeMore',
    defaultMessage: 'See more',
  },
  searchResultsHead: {
    id: 'next.views.AgendaSearch.searchResultHead',
    defaultMessage: 'Search results for "{search}"',
  },
  bigTotal: {
    id: 'next.views.AgendaSearch.bigTotal',
    defaultMessage: 'More than {limit, number} agendas found',
  },
  total: {
    id: 'next.views.AgendaSearch.total',
    defaultMessage:
      '{count, plural, =0 {No agenda found} one {1 agenda found} other {# agendas found}}',
  },
  latestUpdated: {
    id: 'next.views.AgendaSearch.latestUpdated',
    defaultMessage: 'Recently updated agendas',
  },
  upcomingEvents: {
    id: 'next.views.AgendaSearch.upcomingEvents',
    defaultMessage:
      '{count, plural, =0 {No upcoming event} one {1 upcoming event} other {# upcoming events}}',
  },
  passedEvents: {
    id: 'next.views.AgendaSearch.passedEvents',
    defaultMessage:
      '{count, plural, =0 {No passed event} one {1 passed event} other {# passed events}}',
  },
});
