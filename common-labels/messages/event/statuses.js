'use strict';

const { defineMessages } = require('react-intl');

module.exports = defineMessages({
  scheduled: {
    id: 'common.event.statuses.scheduled',
    defaultMessage: 'Scheduled',
  },
  scheduledInfo: {
    id: 'common.event.statuses.scheduledInfo',
    defaultMessage: 'The event is scheduled at the indicated location and time',
  },
  rescheduled: {
    id: 'common.event.statuses.rescheduled',
    defaultMessage: 'Rescheduled',
  },
  rescheduledInfo: {
    id: 'common.event.statuses.rescheduledInfo',
    defaultMessage: 'The timings and dates of the event have been modified',
  },
  movedOnline: {
    id: 'common.event.statuses.movedOnline',
    defaultMessage: 'Moved online',
  },
  movedOnlineInfo: {
    id: 'common.event.statuses.movedOnlineInfo',
    defaultMessage:
      'The event will no longer be attended to at a physical location',
  },
  postponed: {
    id: 'common.event.statuses.postponed',
    defaultMessage: 'Postponed',
  },
  postponedInfo: {
    id: 'common.event.statuses.postponedInfo',
    defaultMessage:
      'The event dates are no longer valid. New dates are not yet known',
  },
  full: {
    id: 'common.event.statuses.full',
    defaultMessage: 'Fully booked',
  },
  fullInfo: {
    id: 'common.event.statuses.fullInfo',
    defaultMessage: 'New participants are no longer accepted to the event',
  },
  cancelled: {
    id: 'common.event.statuses.cancelled',
    defaultMessage: 'Cancelled',
  },
  cancelledInfo: {
    id: 'common.event.statuses.cancelledInfo',
    defaultMessage: 'The event has been permanently cancelled',
  },
});
