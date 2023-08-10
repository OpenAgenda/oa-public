const { defineMessages } = require('react-intl');

module.exports = defineMessages({
  statusScheduled: {
    id: 'common.event.statuses.scheduled',
    defaultMessage: 'Scheduled',
  },
  statusScheduledInfo: {
    id: 'common.event.statuses.scheduledInfo',
    defaultMessage: 'The event is scheduled at the indicated location and time',
  },
  statusRescheduled: {
    id: 'common.event.statuses.rescheduled',
    defaultMessage: 'Rescheduled',
  },
  statusRescheduledInfo: {
    id: 'common.event.statuses.rescheduledInfo',
    defaultMessage: 'The timings and dates of the event have been modified',
  },
  statusMovedOnline: {
    id: 'common.event.statuses.movedOnline',
    defaultMessage: 'Moved online',
  },
  statusMovedOnlineInfo: {
    id: 'common.event.statuses.movedOnlineInfo',
    defaultMessage: 'The event will no longer be attended to at a physical location',
  },
  statusPostponed: {
    id: 'common.event.statuses.postponed',
    defaultMessage: 'Postponed',
  },
  statusPostponedInfo: {
    id: 'common.event.statuses.postponedInfo',
    defaultMessage:
      'The event dates are no longer valid. New dates are not yet known',
  },
  statusFull: {
    id: 'common.event.statuses.full',
    defaultMessage: 'Fully booked',
  },
  statusFullInfo: {
    id: 'common.event.statuses.fullInfo',
    defaultMessage: 'New participants are no longer accepted to the event',
  },
  statusCancelled: {
    id: 'common.event.statuses.cancelled',
    defaultMessage: 'Cancelled',
  },
  statusCancelledInfo: {
    id: 'common.event.statuses.cancelledInfo',
    defaultMessage: 'The event has been permanently cancelled',
  },
});
