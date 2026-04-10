import { useMemo, useCallback } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { ReactSelectInput } from '@openagenda/react-shared';
import useIsPrinting from '../../hooks/useIsPrinting.js';

const messages = defineMessages({
  day: {
    id: 'AgendaStats.IntervalSelect.day',
    defaultMessage: 'day',
  },
  week: {
    id: 'AgendaStats.IntervalSelect.week',
    defaultMessage: 'week',
  },
  month: {
    id: 'AgendaStats.IntervalSelect.month',
    defaultMessage: 'month',
  },
});

const intervalSelectStyles = {
  container: (provided) => ({
    ...provided,
    maxWidth: '150px',
    width: '150px',
    display: 'inline-block',
  }),
  option: (provided) => ({
    ...provided,
    cursor: 'pointer',
    textAlign: 'left',
  }),
};

export default function IntervalSelect({ value, onChange }) {
  const intl = useIntl();

  const intervalOptions = useMemo(
    () => [
      { value: 'day', label: intl.formatMessage(messages.day) },
      { value: 'week', label: intl.formatMessage(messages.week) },
      { value: 'month', label: intl.formatMessage(messages.month) },
    ],
    [intl],
  );

  const valueOption = useMemo(
    () => intervalOptions.find((opt) => opt.value === value),
    [intervalOptions, value],
  );
  const handleChange = useCallback((opt) => onChange(opt.value), [onChange]);
  const isPrinting = useIsPrinting();

  if (isPrinting) {
    return <span>{valueOption?.label}</span>;
  }

  return (
    <ReactSelectInput
      className="oa-interval-select"
      classNamePrefix="oa-interval-select"
      options={intervalOptions}
      value={valueOption}
      onChange={handleChange}
      styles={intervalSelectStyles}
      isSearchable={false}
    />
  );
}
