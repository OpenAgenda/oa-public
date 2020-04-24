import { defineMessages } from 'react-intl';

const messages = defineMessages({
  others: {
    id: 'AgendaStats.utils.addRestItem.others',
    defaultMessage: 'Others'
  }
});

export default function addRestItem(data, total, intl) {
  const itemsInData = data.reduce(
    (res, next) => res + (next.eventCount || 0),
    0
  );
  const diff = total - itemsInData;

  if (!diff) {
    return data;
  }

  const others = intl.formatMessage(messages.others);

  return [
    ...data,
    {
      key: others,
      agenda: {
        uid: others,
        title: others
      },
      eventCount: diff
    }
  ];
}
