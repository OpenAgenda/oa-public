import { defineMessages } from 'react-intl';

const messages = defineMessages({
  // admin mod
  toBeModerated: {
    id: 'next.views.AgendaShow.ContextBar.toBeModerated',
    defaultMessage: '{count, number} to be moderated',
  },
  readyToPublish: {
    id: 'next.views.AgendaShow.ContextBar.readyToPublish',
    defaultMessage: '{count, number} ready to publish',
  },

  // contributor
  refused: {
    id: 'next.views.AgendaShow.ContextBar.refused',
    defaultMessage: '{count, number} refused',
  },
  inModeration: {
    id: 'next.views.AgendaShow.ContextBar.inModeration',
    defaultMessage: '{count, number} in moderation',
  },
  published: {
    id: 'next.views.AgendaShow.ContextBar.published',
    defaultMessage: '{count, number} published',
  },
  drafts: {
    id: 'next.views.AgendaShow.ContextBar.drafts',
    defaultMessage: '{count, number} drafts',
  },

  refusedModalTitle: {
    id: 'next.views.AgendaShow.ContextBar.refusedModalTitle',
    defaultMessage: 'Events refused',
  },
  inModerationModalTitle: {
    id: 'next.views.AgendaShow.ContextBar.inModerationModalTitle',
    defaultMessage: 'Events in moderation',
  },
  publishedModalTitle: {
    id: 'next.views.AgendaShow.ContextBar.publishedModalTitle',
    defaultMessage: 'Events published',
  },
  draftsModalTitle: {
    id: 'next.views.AgendaShow.ContextBar.draftsModalTitle',
    defaultMessage: 'Drafts',
  },

  refusedModalInfo: {
    id: 'next.views.AgendaShow.ContextBar.refusedModalInfo',
    defaultMessage: 'These are the drafts you saved. They are not visible to the agenda moderators. They must be completed before they can be moderated and published.',
  },
  inModerationModalInfo: {
    id: 'next.views.AgendaShow.ContextBar.inModerationModalInfo',
    defaultMessage: 'The following events should be reviewed by the moderators of the agenda before they are published.',
  },
  publishedModalInfo: {
    id: 'next.views.AgendaShow.ContextBar.publishedModalInfo',
    defaultMessage: 'These events have been published and are accessible by the viewers of the agenda.',
  },
  draftsModalInfo: {
    id: 'next.views.AgendaShow.ContextBar.draftsModalInfo',
    defaultMessage: 'These are the drafts you saved. They are not visible to the agenda moderators. They must be completed before they can be moderated and published.',
  },

  empty: {
    id: 'next.views.AgendaShow.ContextBar.empty',
    defaultMessage: 'This agenda is empty',
  },
  events: {
    id: 'next.views.AgendaShow.ContextBar.events',
    defaultMessage: 'Events:',
  },
  manage: {
    id: 'next.views.AgendaShow.ContextBar.manage',
    defaultMessage: 'Manage',
  },
  contribute: {
    id: 'next.views.AgendaShow.ContextBar.contribute',
    defaultMessage: 'Add an event',
  },
  notContributed: {
    id: 'next.views.AgendaShow.ContextBar.notContributed',
    defaultMessage: 'You haven\'t submitted any events to this agenda yet',
  },
  myEvents: {
    id: 'next.views.AgendaShow.ContextBar.myEvents',
    defaultMessage: 'My events in this agenda:',
  },
  complete: {
    id: 'next.views.AgendaShow.ContextBar.complete',
    defaultMessage: 'Complete',
  },
  show: {
    id: 'next.views.AgendaShow.ContextBar.show',
    defaultMessage: 'Show',
  },
  edit: {
    id: 'next.views.AgendaShow.ContextBar.edit',
    defaultMessage: 'Edit',
  },
  undefinedTitle: {
    id: 'next.views.AgendaShow.ContextBar.undefinedTitle',
    defaultMessage: 'Draft event without title',
  },
  undefinedDescription: {
    id: 'next.views.AgendaShow.ContextBar.undefinedDescription',
    defaultMessage: 'Undefined description',
  },
});

export default messages;
