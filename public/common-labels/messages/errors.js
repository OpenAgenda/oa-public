import { defineMessages } from 'react-intl';

export default defineMessages({
  endLessThanBegin: {
    id: 'common.errors.endLessThanBegin',
    defaultMessage:
      'At least one timing is invalid with an begin time occuring after the end time',
  },
  required: {
    id: 'common.errors.required',
    defaultMessage: 'Required',
  },
});
