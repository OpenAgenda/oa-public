import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';

const messages = defineMessages({
  true: {
    id: 'AgendaStats.BooleanTooltipItem.selected',
    defaultMessage: 'Selected',
  },
  false: {
    id: 'AgendaStats.BooleanTooltipItem.notSelected',
    defaultMessage: 'Not selected',
  },
});

export default function BooleanTooltipItem({
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
            <b>
              {messages[label] ? intl.formatMessage(messages[label]) : label}
            </b>
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
