import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Field, useField } from 'react-final-form';
import { endOfDay, isSameDay, parseISO } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import FilterPreviewer from '../FilterPreviewer.js';
import TimelineField from '../fields/TimelineField.js';

const messages = defineMessages({
  dateRange: {
    id: 'ReactFilters.TimelineFilter.dateRange',
    defaultMessage: 'From {startDate} to {endDate}',
  },
  until: {
    id: 'ReactFilters.TimelineFilter.until',
    defaultMessage: 'Until {date}',
  },
  from: {
    id: 'ReactFilters.TimelineFilter.from',
    defaultMessage: 'From {date}',
  },
});

const subscription = { value: true };

function formatDateValue(value) {
  if (!value || value === '') {
    return null;
  }

  return typeof value === 'string' ? parseISO(value) : value;
}

// For display (store -> form)
export function formatValue(value) {
  if (!value || !Array.isArray(value)) {
    return [];
  }

  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzFromStore = value[0].tz ?? currentTz;

  return value.map(({ gte, lte }) => {
    const start = formatDateValue(gte);
    const end = formatDateValue(lte);
    const tzDiff = getTimezoneOffset(tzFromStore, start ?? end ?? new Date())
      - getTimezoneOffset(currentTz, start ?? end ?? new Date());

    const convert = (d) => (tzDiff && d ? utcToZonedTime(d, tzFromStore) : d);

    return {
      startDate: convert(start),
      endDate: convert(end),
    };
  });
}

// For save (form -> store)
function parseValue(value) {
  if (!value.length) {
    return undefined;
  }

  const toStoreObj = ({ startDate, endDate }) => {
    const start = formatDateValue(startDate);
    const end = endDate ? endOfDay(formatDateValue(endDate)) : null;
    return { gte: start, lte: end };
  };

  const result = value.map(toStoreObj);

  if (result.length) {
    result[0].tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  return result.length ? result : undefined;
}

export function Preview({
  name,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = useIntl();
  const { input } = useField(name, { subscription });
  const ranges = formatValue(input.value);

  const firstRange = ranges[0];
  const lastRange = ranges[ranges.length - 1];

  const begin = firstRange.startDate;
  const end = lastRange.endDate;

  const singleDay = begin && end && isSameDay(begin, end);

  const onRemove = useCallback(
    (e) => {
      e.stopPropagation();
      if (!disabled) input.onChange(undefined);
    },
    [input, disabled],
  );

  const fmt = (d) => intl.formatDate(d);

  if (!ranges.length) return null;

  let label;
  if (!begin && !end) return null;
  if (begin && !end) {
    label = intl.formatMessage(messages.from, { date: fmt(begin) });
  } else if (!begin && end) {
    label = intl.formatMessage(messages.until, { date: fmt(end) });
  } else {
    label = singleDay
      ? fmt(begin)
      : intl.formatMessage(messages.dateRange, {
        startDate: fmt(begin),
        endDate: fmt(end),
      });
  }

  return React.createElement(component, {
    name,
    label,
    onRemove,
    disabled,
    ...rest,
  });
}

const TimelineFilter = React.forwardRef(function TimelineFilter(
  { name, className, minDate, maxDate, shownDate, getQuery },
  ref,
) {
  return (
    <Field
      ref={ref}
      name={name}
      subscription={subscription}
      parse={parseValue}
      format={formatValue}
      component={TimelineField}
      className={className}
      minDate={minDate}
      maxDate={maxDate}
      shownDate={shownDate}
      getQuery={getQuery}
    />
  );
});

const exported = React.memo(TimelineFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
