import { defineMessages } from 'react-intl';

export default defineMessages({
  aboutLocation: {
    id: 'next.views.EventShow.aboutLocation',
    defaultMessage: 'About the location',
  },
  additionalFieldsSectionTitle: {
    id: 'next.views.EventShow.additionalFieldsSectionTitle',
    defaultMessage: 'Additionnal information',
  },
  tags: {
    id: 'next.views.EventShow.tags',
    defaultMessage: 'Tags',
  },
  access: {
    id: 'next.views.EventShow.access',
    defaultMessage: 'Access',
  },
  moreLinks: {
    id: 'next.views.EventShow.moreLinks',
    defaultMessage: 'More links:',
  },
  history: {
    id: 'next.views.EventShow.history',
    defaultMessage: 'History',
  },
  contactAdministrators: {
    id: 'next.views.EventShow.contactAdministrators',
    defaultMessage: 'Contact administrators',
  },
  sendAnEmail: {
    id: 'next.views.EventShow.sendAnEmail',
    defaultMessage: 'Send an email',
  },
  seeMore: {
    id: 'next.views.EventShow.Activities.seeMore',
    defaultMessage: 'See more',
  },
  edit: {
    id: 'next.views.EventShow.actions',
    defaultMessage: 'Actions',
  },
  backToList: {
    id: 'next.views.EventShow.backToList',
    defaultMessage: 'Back to list',
  },

  // TODO change id
  editLocation: {
    id: 'next.views.EventShow.EditLocationButton.editLocation',
    defaultMessage: 'Edit location',
  },
  // TODO change id
  suggestLocationChange: {
    id: 'next.views.EventShow.SuggestLocationChangeButton.suggestLocationChange',
    defaultMessage: 'Suggest a change on the location',
  },

  eventNavigation: {
    id: 'next.views.EventShow.eventNavigation',
    defaultMessage: 'Event navigation',
  },

  featured: {
    id: 'next.views.EventShow.ContextBar.featured',
    defaultMessage: 'Featured',
  },
});

export const contextBar = defineMessages({
  backToDashboard: {
    id: 'next.views.EventShow.ContextBar.backToDashboard',
    defaultMessage: 'Back to dashboard',
  },
  edit: {
    id: 'next.views.EventShow.ContextBar.edit',
    defaultMessage: 'Edit',
  },
  editEvent: {
    id: 'next.views.EventShow.ContextBar.editEvent',
    defaultMessage: 'Edit event',
  },
  fixEvent: {
    id: 'next.views.EventShow.ContextBar.fixEvent',
    defaultMessage: 'Fix event',
  },
  editLocation: {
    id: 'next.views.EventShow.ContextBar.editLocation',
    defaultMessage: 'Edit location',
  },
  suggestLocationChange: {
    id: 'next.views.EventShow.ContextBar.suggestLocationChange',
    defaultMessage: 'Suggest a change on the location',
  },
  otherActions: {
    id: 'next.views.EventShow.ContextBar.otherActions',
    defaultMessage: 'Other actions',
  },
  otherActionsInfo: {
    id: 'next.views.EventShow.ContextBar.otherActionsInfo',
    defaultMessage: 'Feature, cancel, postpone, duplicate...',
  },
  feature: {
    id: 'next.views.EventShow.ContextBar.feature',
    defaultMessage: 'Feature',
  },
  unfeature: {
    id: 'next.views.EventShow.ContextBar.unfeature',
    defaultMessage: 'Unfeature',
  },
  transferOwnership: {
    id: 'next.views.EventShow.ContextBar.transferOwnership',
    defaultMessage: 'Transfer ownership',
  },
  transferOwnershipDescription: {
    id: 'next.views.EventShow.ContextBar.transferOwnershipDescription',
    defaultMessage:
      'Hand over ownership of the event to another member of the agenda',
  },
  transferOwnershipDescriptionDisabled: {
    id: 'next.views.EventShow.ContextBar.transferOwnershipDescriptionDisabled',
    defaultMessage:
      'Transferring ownership is only possible if you have edition rights over the event',
  },
  featuredInfo: {
    id: 'next.views.EventShow.ContextBar.featuredInfo',
    defaultMessage: 'A featured event appears at the top of the list',
  },
  duplicate: {
    id: 'next.views.EventShow.ContextBar.duplicate',
    defaultMessage: 'Duplicate',
  },
  duplicateInfo: {
    id: 'next.views.EventShow.ContextBar.duplicateInfo',
    defaultMessage:
      'Load a new event form pre-filled with the details from this event',
  },
  clearStatus: {
    id: 'next.views.EventShow.ContextBar.clearStatus',
    defaultMessage: 'Clear the status of the event',
  },
  clearStatusInfo: {
    id: 'next.views.EventShow.ContextBar.clearStatusInfo',
    defaultMessage: 'The event is not cancelled, nor rescheduled, etc…',
  },
  markAsRescheduled: {
    id: 'next.views.EventShow.ContextBar.markAsRescheduled',
    defaultMessage: 'The event was rescheduled',
  },
  markAsRescheduledInfo: {
    id: 'next.views.EventShow.ContextBar.markAsRescheduledInfo',
    defaultMessage: 'The timings of the event have been modified',
  },
  markAsMovedOnline: {
    id: 'next.views.EventShow.ContextBar.markAsMovedOnline',
    defaultMessage: 'The event was moved online',
  },
  markAsMovedOnlineStatus: {
    id: 'next.views.EventShow.ContextBar.markAsMovedOnlineStatus',
    defaultMessage:
      'The event will no longer be attended to at a physical location',
  },
  markAsPostponed: {
    id: 'next.views.EventShow.ContextBar.markAsPostponed',
    defaultMessage: 'The event is postponed',
  },
  markAsPostponedStatus: {
    id: 'next.views.EventShow.ContextBar.markAsPostponedStatus',
    defaultMessage: 'The event has been postponed to dates not yet known',
  },
  markAsFull: {
    id: 'next.views.EventShow.ContextBar.markAsFull',
    defaultMessage: 'The event is fully booked',
  },
  markAsFullStatus: {
    id: 'next.views.EventShow.ContextBar.markAsFullStatus',
    defaultMessage: 'New participants are no longer accepted to the event',
  },
  markAsCancelled: {
    id: 'next.views.EventShow.ContextBar.markAsCancelled',
    defaultMessage: 'The event is cancelled',
  },
  markAsCancelledStatus: {
    id: 'next.views.EventShow.ContextBar.markAsCancelledStatus',
    defaultMessage: 'The event has been permanently cancelled',
  },
  requestEditionRights: {
    id: 'next.views.EventShow.ContextBar.requestEditionRights',
    defaultMessage: 'Request edition rights',
  },
  requestEditionRightsInfo: {
    id: 'next.views.EventShow.ContextBar.requestEditionRightsInfo',
    defaultMessage:
      'This event comes from another agenda. Edition rights are required to change its main fields (ex: title, description, timings...)',
  },
  deleteEvent: {
    id: 'next.views.EventShow.ContextBar.deleteEvent',
    defaultMessage: 'Delete event',
  },
  deleteEventTitle: {
    id: 'next.views.EventShow.ContextBar.deleteEventTitle',
    defaultMessage: 'Delete the event',
  },
  deleteEventInfo: {
    id: 'next.views.EventShow.ContextBar.deleteEventInfo',
    defaultMessage: 'Permanently delete this event from OpenAgenda',
  },
  removeEvent: {
    id: 'next.views.EventShow.ContextBar.removeEvent',
    defaultMessage: 'Remove from agenda',
  },
  removeEventTitle: {
    id: 'next.views.EventShow.ContextBar.removeEventTitle',
    defaultMessage: 'Remove the event from the agenda',
  },
  removeEventInfo: {
    id: 'next.views.EventShow.ContextBar.removeEventInfo',
    defaultMessage: 'The event will no longer be referenced on the agenda',
  },
  deleteConfirmation: {
    id: 'next.views.EventShow.ContextBar.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this event?',
  },
  removeConfirmation: {
    id: 'next.views.EventShow.ContextBar.removeConfirmation',
    defaultMessage: 'Are you sure you want to remove this event?',
  },
  delete: {
    id: 'next.views.EventShow.ContextBar.delete',
    defaultMessage: 'Delete',
  },
  remove: {
    id: 'next.views.EventShow.ContextBar.remove',
    defaultMessage: 'Remove',
  },
  cancel: {
    id: 'next.views.EventShow.ContextBar.cancel',
    defaultMessage: 'Cancel',
  },
  removing: {
    id: 'next.views.EventShow.ContextBar.removing',
    defaultMessage: 'Removing…',
  },
  retry: {
    id: 'next.views.EventShow.ContextBar.retry',
    defaultMessage: 'Retry',
  },
  deleting: {
    id: 'next.views.EventShow.ContextBar.deleting',
    defaultMessage: 'Deleting…',
  },
  removeSuccess: {
    id: 'next.views.EventShow.ContextBar.removeSuccess',
    defaultMessage:
      'The event was successfully removed. You will now be redirected to the agenda home page.',
  },
  deleteSuccess: {
    id: 'next.views.EventShow.ContextBar.deleteSuccess',
    defaultMessage:
      'The event was successfully deleted. You will now be redirected to the agenda home page.',
  },
  eventNotFound: {
    id: 'next.views.EventShow.ContextBar.eventNotFound',
    defaultMessage:
      'The event could not be found. It may have already been removed.',
  },
  reloadPage: {
    id: 'next.views.EventShow.ContextBar.reloadPage',
    defaultMessage: 'Reload the page',
  },
  removeGenericError: {
    id: 'next.views.EventShow.ContextBar.removeGenericError',
    defaultMessage:
      'An error occurred. Please try again and contact support if the problem persists.',
  },
  contactSupport: {
    id: 'next.views.EventShow.ContextBar.contactSupport',
    defaultMessage: 'Contact support',
  },
  state: {
    id: 'next.views.EventShow.ContextBar.state',
    defaultMessage: 'State:',
  },
  refusedInfo: {
    id: 'next.views.EventShow.ContextBar.refusedInfo',
    defaultMessage:
      'This event is not compatible with the agenda and should not be published',
  },
  toModerateInfo: {
    id: 'next.views.EventShow.ContextBar.toModerateInfo',
    defaultMessage:
      'This event needs to be verified and is not ready for publication',
  },
  readyToPublishInfo: {
    id: 'next.views.EventShow.ContextBar.readyToPublishInfo',
    defaultMessage: 'This event has been verified and is ready to be published',
  },
  publishedInfo: {
    id: 'next.views.EventShow.ContextBar.publishedInfo',
    defaultMessage: 'This event is visible on the agenda',
  },
  refusedContributorInfo: {
    id: 'next.views.EventShow.ContextBar.refusedContributorInfo',
    defaultMessage:
      'This event has been rejected by agenda administrators and will not be published.',
  },
  toModerateContributorInfo: {
    id: 'next.views.EventShow.ContextBar.toModerateContributorInfo',
    defaultMessage:
      'This event will be verified by administrators prior to its publication.',
  },
  readyToPublishContributorInfo: {
    id: 'next.views.EventShow.ContextBar.readyToPublishContributorInfo',
    defaultMessage:
      'This event has been validated by moderators. It will be published without further changes.',
  },
  publishedContributorInfo: {
    id: 'next.views.EventShow.ContextBar.publishedContributorInfo',
    defaultMessage: 'This event is published and displayed on the agenda.',
  },
  contactAdministrators: {
    id: 'next.views.EventShow.ContextBar.contactAdministrators',
    defaultMessage: 'Contact administrators',
  },
  invalidEvent: {
    id: 'next.views.EventShow.ContextBar.invalidEvent',
    defaultMessage: 'The event is invalid',
  },
  invalidEventMessage: {
    id: 'next.views.EventShow.ContextBar.invalidEventMessage',
    defaultMessage:
      'This event has an issue that needs to be corrected before this action can be performed.',
  },
  motive: {
    id: 'next.views.EventShow.ContextBar.motive',
    defaultMessage: 'Motive',
  },
  nonCompliant: {
    id: 'views.EventShow.contextBar.nonCompliant',
    defaultMessage: 'Non-compliant',
  },
  invalidEventInfo: {
    id: 'views.EventShow.contextBar.invalidEventInfo',
    defaultMessage:
      'This event does not meet the criteria defined by the agenda form. This can happen if the form configuration has changed. To correct the event, edit it.',
  },
  editMember: {
    id: 'views.EventShow.contextBar.editMember',
    defaultMessage: "Edit the contributor's information",
  },
  editMemberMe: {
    id: 'views.EventShow.contextBar.editMemberMe',
    defaultMessage: 'Edit my information',
  },
});

export const duplicateModal = defineMessages({
  bigSentence: {
    id: 'next.views.EventShow.DuplicateModal.bigSentence',
    defaultMessage: 'You are about to create a new event based on a precedent.',
  },
  reminder: {
    id: 'next.views.EventShow.DuplicateModal.reminder',
    defaultMessage:
      'Reminder: A single event can be shared across multiple agendas. Do not create a duplicate! Duplication creates a different ad, usually for a new edition elsewhere in time or space, avoiding copying and pasting.',
  },
  createNewEventIn: {
    id: 'next.views.EventShow.DuplicateModal.createNewEventIn',
    defaultMessage: 'Create the new event in',
  },
  or: {
    id: 'next.views.EventShow.DuplicateModal.or',
    defaultMessage: 'Or',
  },
  selectAnAgenda: {
    id: 'next.views.EventShow.DuplicateModal.selectAnAgenda',
    defaultMessage: 'Select an agenda',
  },
});

export const shareModal = defineMessages({
  onOA: {
    id: 'next.views.EventShow.ShareModal.onOA',
    defaultMessage: 'On OpenAgenda',
  },
  shareEvent: {
    id: 'next.views.EventShow.ShareModal.shareEvent',
    defaultMessage: 'Share / Export the event',
  },
  shareOnSocialNetworks: {
    id: 'next.views.EventShow.ShareModal.shareOnSocialNetworks',
    defaultMessage: 'On social networks',
  },
  shareByEmail: {
    id: 'next.views.EventShow.ShareModal.shareByEmail',
    defaultMessage: 'By email',
  },
  shareByEmailPlaceholder: {
    id: 'next.views.EventShow.ShareModal.shareByEmailPlaceholder',
    defaultMessage: 'Type the email addresses you want to send the event',
  },
  byEmailSub: {
    id: 'next.views.EventShow.ShareModal.byEmailSub',
    defaultMessage: 'The event will not be sent to more than 50 recipients',
  },
  send: {
    id: 'next.views.EventShow.ShareModal.send',
    defaultMessage: 'Send',
  },
  shareCalendar: {
    id: 'next.views.EventShow.ShareModal.shareCalendar',
    defaultMessage: 'Import in a personal calendar',
  },
  selectTiming: {
    id: 'next.views.EventShow.ShareModal.selectTiming',
    defaultMessage: 'Select a timing',
  },
  import: {
    id: 'next.views.EventShow.ShareModal.import',
    defaultMessage: 'Import',
  },
  shareLink: {
    id: 'next.views.EventShow.ShareModal.shareLink',
    defaultMessage: 'Share link',
  },
  copy: {
    id: 'next.views.EventShow.ShareModal.copy',
    defaultMessage: 'Copy',
  },
  copied: {
    id: 'next.views.EventShow.ShareModal.copied',
    defaultMessage: 'Copied',
  },
  mustSignIn: {
    id: 'next.views.EventShow.ShareModal.mustSignIn',
    defaultMessage: 'You must sign in to share this event',
  },
  signIn: {
    id: 'next.views.EventShow.ShareModal.signIn',
    defaultMessage: 'Sign in',
  },
  online: {
    id: 'next.views.EventShow.ShareModal.online',
    defaultMessage: 'Online',
  },
});

export const additionalFields = defineMessages({
  restrictedInformation: {
    id: 'next.views.EventShow.AdditionalFields.restrictedInformation',
    defaultMessage: 'Restricted information',
  },
  noSelection: {
    id: 'next.views.EventShow.AdditionalFields.noSelection',
    defaultMessage: 'No selection',
  },
  noInput: {
    id: 'next.views.EventShow.AdditionalFields.noInput',
    defaultMessage: 'No input',
  },
  noImage: {
    id: 'next.views.EventShow.AdditionalFields.noImage',
    defaultMessage: 'No image is loaded',
  },
  noFile: {
    id: 'next.views.EventShow.AdditionalFields.noFile',
    defaultMessage: 'No file is loaded',
  },
});

export const agendaHeader = defineMessages({
  showAllEvents: {
    id: 'next.views.EventShow.AgendaHeader.showAllEvents',
    defaultMessage: 'Show all events',
  },
  viewNetworkAgendas: {
    id: 'next.views.EventShow.AgendaHeader.viewNetworkAgendas',
    defaultMessage: 'View network agendas',
  },
});

export const contributorSection = defineMessages({
  contributor: {
    id: 'next.views.EventShow.ContributorSection.contributor',
    defaultMessage: 'Contributor',
  },
  privateInformation: {
    id: 'next.views.EventShow.ContributorSection.privateInformation',
    defaultMessage: 'Private information',
  },
  edit: {
    id: 'next.views.EventShow.ContributorSection.edit',
    defaultMessage: "Edit the contributor's information",
  },
  meEdit: {
    id: 'next.views.EventShow.ContributorSection.meEdit',
    defaultMessage: 'Edit my information',
  },
  emptyMember: {
    id: 'next.views.EventShow.ContributorSection.emptyMember',
    defaultMessage: 'Contact sheet not informed',
  },
});

export const emailConfirmationAlert = defineMessages({
  shareEvent: {
    id: 'next.views.EventShow.EmailConfirmationAlert.shareEvent',
    defaultMessage: 'Share event',
  },
  shareEventInfo: {
    id: 'next.views.EventShow.EmailConfirmationAlert.shareEventInfo',
    defaultMessage:
      'The event was sent to {count, plural, one {# email address} other {# email addresses}}.',
  },
  close: {
    id: 'next.views.EventShow.EmailConfirmationAlert.close',
    defaultMessage: 'Close',
  },
});

export const footer = defineMessages({
  help: {
    id: 'next.views.EventShow.Footer.help',
    defaultMessage: 'Help',
  },
  termsOfUse: {
    id: 'next.views.EventShow.Footer.termsOfUse',
    defaultMessage: 'Terms of use',
  },
});

export const inbox = defineMessages({
  inbox: {
    id: 'next.views.EventShow.Inbox.inbox',
    defaultMessage: 'Inbox',
  },
});

export const locationHistory = defineMessages({
  showHistory: {
    id: 'next.views.EventShow.LocationHistory.showHistory',
    defaultMessage: 'Show history',
  },
  locationHistory: {
    id: 'next.views.EventShow.LocationHistory.locationHistory',
    defaultMessage: 'Location history',
  },
  noActivity: {
    id: 'next.views.EventShow.LocationHistory.noActivity',
    defaultMessage: 'no activity',
  },
});

export const navigationButton = defineMessages({
  previousEvent: {
    id: 'next.views.EventShow.NavigationButton.previousEvent',
    defaultMessage: 'Previous event',
  },
  nextEvent: {
    id: 'next.views.EventShow.NavigationButton.nextEvent',
    defaultMessage: 'Next event',
  },
});

export const sidebar = defineMessages({
  share: {
    id: 'next.views.EventShow.Sidebar.share',
    defaultMessage: 'Share / Export',
  },
  accessEventOnline: {
    id: 'next.views.EventShow.Sidebar.accessEventOnline',
    defaultMessage: 'Access the event online',
  },
  passed: {
    id: 'next.views.EventShow.Sidebar.passed',
    defaultMessage: 'Passed',
  },
  conditions: {
    id: 'next.views.EventShow.Sidebar.conditions',
    defaultMessage: 'Conditions',
  },
  registration: {
    id: 'next.views.EventShow.Sidebar.registration',
    defaultMessage: 'Registration',
  },
  completeLink: {
    id: 'next.views.EventShow.Sidebar.completeLink',
    defaultMessage: 'Complete link',
  },
  registerBook: {
    id: 'next.views.EventShow.Sidebar.registerBook',
    defaultMessage: 'Register / book:',
  },
  accessPassOffer: {
    id: 'next.views.EventShow.Sidebar.accessPassOffer',
    defaultMessage: 'Access the pass Culture offer',
  },
  startingAt: {
    id: 'next.views.EventShow.Sidebar.startingAt',
    defaultMessage: 'Starting at {min} years old',
  },
  minToMaxYearsOld: {
    id: 'next.views.EventShow.Sidebar.minToMaxYearsOld',
    defaultMessage: '{min} to {max} years old',
  },
  passUnpublished: {
    id: 'next.views.EventShow.Sidebar.passUnpublished',
    defaultMessage: 'The offer will be created upon publication of the event',
  },
  passPublishedErrors: {
    id: 'next.views.EventShow.Sidebar.passPublishedErrors',
    defaultMessage: 'The creation of the offer encountered errors',
  },
});

export const timings = defineMessages({
  previousMonth: {
    id: 'next.views.EventShow.Timings.previousMonth',
    defaultMessage: 'Previous month',
  },
  nextMonth: {
    id: 'next.views.EventShow.Timings.nextMonth',
    defaultMessage: 'Next month',
  },
  calendarNavigation: {
    id: 'next.views.EventShow.Timings.calendarNavigation',
    defaultMessage: 'Calendar navigation for selecting month',
  },
  navigationByMonth: {
    id: 'next.views.EventShow.Timings.navigationByMonth',
    defaultMessage: 'Navigation by month',
  },
});

export const transferOwnershipModal = defineMessages({
  transferOwnership: {
    id: 'next.views.EventShow.transferOwnershipModal.transferOwnership',
    defaultMessage: 'Transfer ownership',
  },
  nameless: {
    id: 'next.views.EventShow.transferOwnershipModal.nameless',
    defaultMessage: 'Nameless',
  },
  transfer: {
    id: 'next.views.EventShow.transferOwnershipModal.transfer',
    defaultMessage: 'Transfer',
  },
  ownershipTransfered: {
    id: 'next.views.EventShow.transferOwnershipModal.ownershipTransfered',
    defaultMessage: 'Ownership of the event has been transferred.',
  },
  close: {
    id: 'next.views.EventShow.transferOwnershipModal.close',
    defaultMessage: 'Close',
  },
});

export const rejectModal = defineMessages({
  motive: {
    id: 'next.views.EventShow.rejectModal.motive',
    defaultMessage: 'Motive',
  },
  motiveInfo: {
    id: 'next.views.EventShow.rejectModal.motiveInfo',
    defaultMessage:
      'The motive will be presented to the contributor in the notification sent to him by email as well as directly associated with the status on the event page.',
  },
  motivePlaceholder: {
    id: 'next.views.EventShow.rejectModal.motivePlaceholder',
    defaultMessage: 'Motive for rejection',
  },
  confirmRejection: {
    id: 'next.views.EventShow.rejectModal.confirmRejection',
    defaultMessage: 'Confirm rejection',
  },
  confirm: {
    id: 'next.views.EventShow.rejectModal.confirm',
    defaultMessage: 'Confirm',
  },
});
