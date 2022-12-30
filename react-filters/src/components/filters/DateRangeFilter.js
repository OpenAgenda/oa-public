import React, { useCallback, useMemo, useState } from 'react';
import { Field, useField } from 'react-final-form';
import { defineMessages, useIntl } from 'react-intl';
import { parseISO, endOfDay, isSameDay } from 'date-fns';
import { utcToZonedTime, getTimezoneOffset } from 'date-fns-tz';
import DateRangePicker from '../fields/DateRangePicker';
import Title from '../Title';
import Panel from '../Panel';
import FilterPreviewer from '../FilterPreviewer';

const messages = defineMessages({
  dateRange: {
    id: 'ReactFilters.DateRangeFilter.dateRange',
    defaultMessage:
      'From {startDate} to {endDate}',
  },
  startDate: {
    id: 'ReactFilters.DateRangeFilter.startDate',
    defaultMessage: 'Start',
  },
  endDate: {
    id: 'ReactFilters.DateRangeFilter.endDate',
    defaultMessage: 'End',
  },
  until: {
    id: 'ReactFilters.DateRangeFilter.until',
    defaultMessage: 'Until {date}',
  },
  from: {
    id: 'ReactFilters.DateRangeFilter.from',
    defaultMessage: 'From {date}',
  },
});

const subscription = { value: true };

// For display (store -> form)
export function formatValue(value) {
  if (value === undefined) {
    return [
      {
        startDate: null,
        endDate: null,
        key: 'selection',
      },
    ];
  }

  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDiff = getTimezoneOffset(value.tz, value.gte) - getTimezoneOffset(currentTz, value.gte);

  if (Array.isArray(value)) {
    return value.map(v => {
      const startDate = typeof v.gte === 'string' ? parseISO(v.gte) : v.gte;
      const endDate = typeof v.lte === 'string' ? parseISO(v.lte) : v.lte;

      return {
        ...v,
        startDate: tzDiff ? utcToZonedTime(startDate, v.tz) : startDate,
        endDate: tzDiff ? utcToZonedTime(endDate, v.tz) : endDate,
      };
    });
  }

  if (typeof value === 'object') {
    const startDate = typeof value.gte === 'string' ? parseISO(value.gte) : value.gte;
    const endDate = typeof value.lte === 'string' ? parseISO(value.lte) : value.lte;

    return [
      {
        startDate: tzDiff ? utcToZonedTime(startDate, value.tz) : startDate,
        endDate: tzDiff ? utcToZonedTime(endDate, value.tz) : endDate,
        key: 'selection',
      },
    ];
  }

  return value;
}

// For save (form -> store)
function parseValue(value) {
  if (!value) {
    return value;
  }

  const [selection] = value;

  if (selection.startDate === null && selection.endDate === null) {
    return undefined;
  }

  return {
    gte: selection.startDate.toISOString(),
    lte: (selection.endDate ? endOfDay(selection.endDate) : selection.endDate).toISOString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

function Preview({
  name,
  staticRanges = [],
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const intl = useIntl();
  const { input } = useField(name, { subscription });
  const { tz } = input.value;
  const value = formatValue(input.value)[0];

  const selectedStaticRange = useMemo(
    () => value && staticRanges.find(v => v.isSelected(value, tz)),
    [value, staticRanges, tz],
  );

  const singleDay = useMemo(
    () => value?.startDate
      && value?.endDate
      && isSameDay(value.startDate, value.endDate),
    [value],
  );

  const onRemove = useCallback(
    e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      input.onChange(undefined);
    },
    [input, disabled],
  );

  let label;

  if (!value?.startDate && !value?.endDate) {
    return null;
  }

  const formatDate = v => intl.formatDate(v, /* { timeZone: tz } */);

  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else if (value.startDate === null) {
    label = intl.formatMessage(messages.until, {
      date: formatDate(value.endDate),
    });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages.from, {
      date: formatDate(value.startDate),
    });
  } else {
    label = singleDay
      ? formatDate(value.startDate)
      : intl.formatMessage(messages.dateRange, {
        startDate: formatDate(value.startDate),
        endDate: formatDate(value.endDate),
      });
  }

  return React.createElement(component, {
    name,
    staticRanges,
    label,
    onRemove,
    disabled,
    ...rest,
  });
}

const DateRangeFilter = React.forwardRef(function DateRangeFilter(
  {
    name,
    staticRanges,
    inputRanges,
    rangeColor,
    className,
  },
  ref,
) {
  const intl = useIntl();

  return (
    <Field
      ref={ref}
      name={name}
      subscription={subscription}
      parse={parseValue}
      format={formatValue}
      component={DateRangePicker}
      staticRanges={staticRanges}
      inputRanges={inputRanges}
      startDatePlaceholder={intl.formatMessage(messages.startDate)}
      endDatePlaceholder={intl.formatMessage(messages.endDate)}
      rangeColor={rangeColor}
      className={className}
    />
  );
});

const Collapsable = React.forwardRef(function Collapsable(
  {
    name,
    filter,
    component,
    disabled,
    staticRanges,
    inputRanges,
    ...rest
  },
  ref,
) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Panel
      header={(
        <Title
          name={name}
          filter={filter}
          component={Preview}
          staticRanges={staticRanges}
          disabled={disabled}
        />
      )}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      <DateRangeFilter
        ref={ref}
        name={name}
        filter={filter}
        component={component}
        staticRanges={staticRanges}
        inputRanges={inputRanges}
        disabled={disabled}
        collapsed={collapsed}
        {...rest}
      />
    </Panel>
  );
});

const exported = React.memo(DateRangeFilter);

// React.memo lose statics
exported.Preview = Preview;
exported.Collapsable = Collapsable;

export default exported;
