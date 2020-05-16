import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Text } from 'recharts';

export default function DateAxisTick({ interval, payload, ...rest }) {
  const intl = useIntl();

  const dateFormatOptions = useMemo(() => {
    if (interval === 'day') {
      return {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      };
    }

    if (interval === 'week') {
      return {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      };
    }

    if (interval === 'month') {
      return {
        month: 'numeric',
        year: 'numeric'
      };
    }
  }, [interval]);

  return (
    <Text {...rest}>
      {intl.formatDate(new Date(payload.value), dateFormatOptions)}
    </Text>
  );
}
