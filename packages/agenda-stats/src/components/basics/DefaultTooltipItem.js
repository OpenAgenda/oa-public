import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { getValueByDataKey } from 'recharts/lib/util/ChartUtils';
import { getLocaleValue } from '@openagenda/intl';

const messages = defineMessages({
  events: {
    id: 'AgendaStats.CustomTooltip.events',
    defaultMessage: '{value, number} events',
  },
});

export default function DefaultTooltipItem({
  message,
  entry,
  dataKey,
  hideLabel,
}) {
  const intl = useIntl();
  const label = getLocaleValue(
    getValueByDataKey(entry.payload, dataKey),
    intl.locale
  );

  return (
    <li className="recharts-tooltip-item">
      <span>
        {!hideLabel ? (
          <>
            <b>{label}</b>
            <br />
          </>
        ) : null}
        {intl.formatMessage(message || messages.events, {
          value: entry.value,
          dataKey: entry.dataKey,
        })}
      </span>
    </li>
  );
}
