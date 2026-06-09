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
  signin: {
    id: 'next.views.AgendaShow.signin',
    defaultMessage: 'Sign in',
  },
});

export const agendaError = defineMessages({
  restrictedAccess: {
    id: 'next.views.AgendaError.restrictedAccess',
    defaultMessage: 'Restricted access',
  },
  unauthorizedMsg: {
    id: 'next.views.AgendaError.unauthorizedMsg',
    defaultMessage:
      'Access to this agenda is restricted,{br}authenticate yourself before you can access it.',
  },
  signIn: {
    id: 'next.views.AgendaError.signIn',
    defaultMessage: 'Sign in',
  },
  orSignUp: {
    id: 'next.views.AgendaError.orSignup',
    defaultMessage: "Or <link>sign up</link> if you don't have an account yet.",
  },
  forbiddenMsg: {
    id: 'next.views.AgendaError.forbiddenMsg',
    defaultMessage:
      'You do not have access to this agenda.{br}Check the link provided to you or request access.',
  },
  requestInvitation: {
    id: 'next.views.AgendaError.requestInvitation',
    defaultMessage: 'Request an invitation',
  },
  agendaNotFound: {
    id: 'next.views.AgendaError.agendaNotFound',
    defaultMessage: 'Agenda not found',
  },
  notFoundMsg: {
    id: 'next.views.AgendaError.notFoundMsg',
    defaultMessage:
      'There is no agenda corresponding to this link.{br}Either the link is invalid or the agenda has been deleted.',
  },
  searchAgenda: {
    id: 'next.views.AgendaError.searchAgenda',
    defaultMessage: 'Search an agenda',
  },
});
