import { defineMessages } from 'react-intl';

export default defineMessages({
  export: {
    id: 'EventAdminApp.messages.exports.export',
    defaultMessage: 'Export',
  },
  exportDesc: {
    id: 'EventAdminApp.messages.exports.exportDesc',
    defaultMessage:
      'Export {total, plural, =0 {# event} one {# event} other {# events}}',
  },
  exportSelection: {
    id: 'EventAdminApp.messages.exports.exportSelection',
    defaultMessage: 'Export selection',
  },
  toJSON: {
    id: 'EventAdminApp.messages.exports.toJSON',
    defaultMessage: 'to JSON',
  },
  toSpreadsheet: {
    id: 'EventAdminApp.messages.exports.toSpreadsheet',
    defaultMessage: 'to spreadsheet (csv / xlsx)',
  },
  toICS: {
    id: 'EventAdminApp.messages.exports.toICS',
    defaultMessage: 'to ICS',
  },
  toMD: {
    id: 'EventAdminApp.messages.exports.toMD',
    defaultMessage: 'to MD',
  },
  toTXT: {
    id: 'EventAdminApp.messages.exports.toTXT',
    defaultMessage: 'to TXT',
  },
  toRSS: {
    id: 'EventAdminApp.messages.exports.toRSS',
    defaultMessage: 'to RSS',
  },
  toDOCX: {
    id: 'EventAdminApp.messages.exports.toDOCX',
    defaultMessage: 'to DOCX',
  },
});
