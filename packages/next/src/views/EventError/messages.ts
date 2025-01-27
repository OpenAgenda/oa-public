import { defineMessages } from 'react-intl';

export default defineMessages({
  restrictedAccess: {
    id: 'next.views.EventError.restrictedAccess',
    defaultMessage: 'Restricted access',
  },
  unauthorizedMsg: {
    id: 'next.views.EventError.unauthorizedMsg',
    defaultMessage:
      'Access to this event is restricted,{br}authenticate yourself before you can access it.',
  },
  signIn: {
    id: 'next.views.EventError.signIn',
    defaultMessage: 'Sign in',
  },
  orSignUp: {
    id: 'next.views.EventError.orSignup',
    defaultMessage: "Or <link>sign up</link> if you don't have an account yet.",
  },
  forbiddenMsg: {
    id: 'next.views.EventError.forbiddenMsg',
    defaultMessage:
      'You do not have access to this event.{br}Check the link provided to you or request access.',
  },
  contactAdministrators: {
    id: 'next.views.EventError.contactAdministrators',
    defaultMessage: 'Contact administrators',
  },
  agendaNotFound: {
    id: 'next.views.EventError.agendaNotFound',
    defaultMessage: 'Agenda not found',
  },
  notFoundMsg: {
    id: 'next.views.EventError.notFoundMsg',
    defaultMessage:
      'There is no event corresponding to this link.{br} Either the link is invalid or the agenda has been deleted.',
  },
  searchAgenda: {
    id: 'next.views.EventError.searchAgenda',
    defaultMessage: 'Search an agenda',
  },
  eventNotFound: {
    id: 'next.views.EventError.eventNotFound',
    defaultMessage: 'Event not found',
  },
  seeAgenda: {
    id: 'next.views.EventError.seeAgenda',
    defaultMessage: 'See agenda',
  },
});
