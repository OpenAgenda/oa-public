import React, { useMemo, useCallback } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { ReactSelectInput } from '@openagenda/react-shared';

const messages = defineMessages({
  day: {
    id: 'AgendaStats.IntervalSelect.day',
    defaultMessage: 'day'
  },
  week: {
    id: 'AgendaStats.IntervalSelect.week',
    defaultMessage: 'week'
  },
  month: {
    id: 'AgendaStats.IntervalSelect.month',
    defaultMessage: 'month'
  }
});

const intervalSelectStyles = {
  container: provided => ({
    ...provided,
    maxWidth: '150px',
    width: '150px',
    display: 'inline-block'
  }),
  option: provided => ({
    ...provided,
    textAlign: 'left'
  })
};

export default function IntervalSelect({ value, onChange }) {
  const intl = useIntl();

  const intervalOptions = useMemo(
    () => [
      { value: 'day', label: intl.formatMessage(messages.day) },
      { value: 'week', label: intl.formatMessage(messages.week) },
      { value: 'month', label: intl.formatMessage(messages.month) }
    ],
    [intl]
  );

  const valueOption = useMemo(
    () => intervalOptions.find(opt => opt.value === value),
    [intervalOptions, value]
  );
  const handleChange = useCallback(opt => onChange(opt.value), [onChange]);

  return (
    <ReactSelectInput
      options={intervalOptions}
      value={valueOption}
      onChange={handleChange}
      styles={intervalSelectStyles}
    />
  );
}
