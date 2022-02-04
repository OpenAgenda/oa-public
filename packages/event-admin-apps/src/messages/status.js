import { defineMessages } from 'react-intl';

export default defineMessages({
  programmed: {
    id: 'EventAdminApp.messages.status.programmed', // 1
    defaultMessage: 'Programmed',
  },
  rescheduled: {
    id: 'EventAdminApp.messages.status.rescheduled', // 2
    defaultMessage: 'Rescheduled',
  },
  movedOnline: {
    id: 'EventAdminApp.messages.status.movedOnline', // 3
    defaultMessage: 'Moved online',
  },
  postponed: {
    id: 'EventAdminApp.messages.status.postponed', // 4
    defaultMessage: 'Postponed',
  },
  full: {
    id: 'EventAdminApp.messages.status.full', // 5
    defaultMessage: 'Fully booked',
  },
  cancelled: {
    id: 'EventAdminApp.messages.status.cancelled', // 6
    defaultMessage: 'Cancelled',
  },
});
