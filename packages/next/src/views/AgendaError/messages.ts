import { defineMessages } from 'react-intl';

export default defineMessages({
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
      'There is no calendar corresponding to this link.{br}Either the link is invalid or the calendar has been deleted.',
  },
  searchAgenda: {
    id: 'next.views.AgendaError.searchAgenda',
    defaultMessage: 'Search an agenda',
  },
});
