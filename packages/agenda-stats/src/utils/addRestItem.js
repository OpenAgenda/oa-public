import _ from 'lodash';
import { defineMessages } from 'react-intl';

const messages = defineMessages({
  others: {
    id: 'AgendaStats.utils.addRestItem.others',
    defaultMessage: 'Others'
  },
  noValue: {
    id: 'AgendaStats.utils.addRestItem.noValue',
    defaultMessage: 'No value'
  }
});

export default function addRestItem(
  data,
  total,
  intl,
  dataKey = 'eventCount',
  labelKey = 'key',
  noValue = false
) {
  const itemsInData = data.reduce(
    (res, next) => res + (next.eventCount || 0),
    0
  );
  const diff = total - itemsInData;

  if (!diff) {
    return data;
  }

  const message = intl.formatMessage(
    noValue ? messages.noValue : messages.others
  );

  const otherItem = {};

  _.set(otherItem, labelKey, message);
  _.set(otherItem, dataKey, diff);

  return [
    ...data,
    otherItem
  ];
}
