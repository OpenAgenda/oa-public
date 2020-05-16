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

export default function addRestItem(data, total, intl, noValue = false) {
  const itemsInData = data.reduce(
    (res, next) => res + (next.eventCount || 0),
    0
  );
  const diff = total - itemsInData;

  if (!diff) {
    return data;
  }

  const others = intl.formatMessage(
    noValue ? messages.noValue : messages.others
  );

  return [
    ...data,
    {
      key: others,
      agenda: {
        uid: others,
        title: others
      },
      label: others,
      eventCount: diff
    }
  ];
}
