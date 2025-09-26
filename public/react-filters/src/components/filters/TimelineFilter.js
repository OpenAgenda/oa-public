import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Field, useField } from 'react-final-form';
import { isSameDay, parseISO, addDays } from 'date-fns';
import {
  getTimezoneOffset,
  utcToZonedTime,
  zonedTimeToUtc,
  formatInTimeZone,
} from 'date-fns-tz';
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
  if (!value) return [];
  if (!Array.isArray(value)) return formatValue([value]);

  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzFromStore = value[0]?.tz ?? currentTz;

  const out = [];

  const convert = (d) => {
    if (!d) return d;
    const tzDiff = getTimezoneOffset(tzFromStore, d) - getTimezoneOffset(currentTz, d);
    return tzDiff ? utcToZonedTime(d, tzFromStore) : d;
  };

  for (const { gte, lte } of value) {
    const start = formatDateValue(gte);
    const end = formatDateValue(lte);

    if (!start || !end) {
      out.push({
        startDate: convert(start || null),
        endDate: convert(end || null),
      });
      continue;
    }

    const startDayStr = formatInTimeZone(start, tzFromStore, 'yyyy-MM-dd');
    const endDayStr = formatInTimeZone(end, tzFromStore, 'yyyy-MM-dd');

    let cursorNaive = new Date(`${startDayStr}T00:00:00.000`);
    const lastNaive = new Date(`${endDayStr}T00:00:00.000`);

    while (cursorNaive <= lastNaive) {
      const dayStr = formatInTimeZone(cursorNaive, tzFromStore, 'yyyy-MM-dd');

      const dayStartUTC = zonedTimeToUtc(
        new Date(`${dayStr}T00:00:00.000`),
        tzFromStore,
      );
      const dayEndUTC = zonedTimeToUtc(
        new Date(`${dayStr}T23:59:59.999`),
        tzFromStore,
      );

      const segStartUTC = dayStr === startDayStr ? start : dayStartUTC;
      const segEndUTC = dayStr === endDayStr ? end : dayEndUTC;

      out.push({
        startDate: convert(segStartUTC),
        endDate: convert(segEndUTC),
      });

      cursorNaive = addDays(cursorNaive, 1);
    }
  }

  return out;
}

// For save (form -> store)
function parseValue(value) {
  if (!value.length) return undefined;

  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const days = value
    .map(({ startDate, endDate }) => formatDateValue(startDate || endDate))
    .filter(Boolean)
    .map((d) => formatInTimeZone(d, currentTz, 'yyyy-MM-dd'))
    .sort();

  if (!days.length) return undefined;

  const uniqDays = Array.from(new Set(days));

  const groups = [];
  let groupStart = uniqDays[0];
  let prev = uniqDays[0];

  const isNextDay = (a, b) => {
    const aDate = new Date(`${a}T00:00:00.000`);
    const bDate = new Date(`${b}T00:00:00.000`);
    return addDays(aDate, 1).getTime() === bDate.getTime();
  };

  for (let i = 1; i < uniqDays.length; i++) {
    const cur = uniqDays[i];
    if (isNextDay(prev, cur)) {
      prev = cur;
      continue;
    }
    groups.push([groupStart, prev]);
    groupStart = cur;
    prev = cur;
  }
  groups.push([groupStart, prev]);

  const result = groups.map(([firstDay, lastDay]) => {
    const gteUTC = zonedTimeToUtc(
      new Date(`${firstDay}T00:00:00.000`),
      currentTz,
    ).toISOString();

    const lteUTC = zonedTimeToUtc(
      new Date(`${lastDay}T23:59:59.999`),
      currentTz,
    ).toISOString();

    return { gte: gteUTC, lte: lteUTC };
  });

  if (result.length) {
    result[0].tz = currentTz;
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
