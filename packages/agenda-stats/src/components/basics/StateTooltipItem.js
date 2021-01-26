import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';

const messages = defineMessages({
  '-1': {
    id: 'AgendaStats.StateTooltipItem.refused',
    defaultMessage: 'Refused',
  },
  0: {
    id: 'AgendaStats.StateTooltipItem.toModerate',
    defaultMessage: 'To control',
  },
  1: {
    id: 'AgendaStats.StateTooltipItem.controlled',
    defaultMessage: 'Controlled',
  },
  2: {
    id: 'AgendaStats.StateTooltipItem.published',
    defaultMessage: 'Published',
  },
});

export default function StateTooltipItem({
  message,
  entry,
  dataKey,
  hideLabel,
}) {
  const intl = useIntl();
  const label = getValueByDataKey(entry.payload, dataKey);

  return (
    <li className="recharts-tooltip-item">
      <span>
        {!hideLabel ? (
          <>
            <b>{intl.formatMessage(messages[label])}</b>
            <br />
          </>
        ) : null}
        {intl.formatMessage(message, {
          value: entry.value,
          dataKey: entry.dataKey,
        })}
      </span>
    </li>
  );
}
