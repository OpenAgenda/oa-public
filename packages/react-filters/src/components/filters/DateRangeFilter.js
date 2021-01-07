import React, { useCallback, useMemo } from 'react';
import { Field, useForm, useField } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { defineMessages, useIntl } from 'react-intl';
import { useDebouncedCallback } from 'use-debounce';
import { endOfDay, isSameDay } from 'date-fns';
import useFilterTitle from '../../hooks/useFilterTitle';
import Panel from '../Panel';
import ValueBadge from '../ValueBadge';
import DateRangePicker from '../fields/DateRangePicker';

const messages = defineMessages({
  singleDate: {
    id: 'ReactFilters.DateRangeFilter.singleDate',
    defaultMessage: '{date, time, ::yyyyMMdd}',
  },
  dateRange: {
    id: 'ReactFilters.DateRangeFilter.dateRange',
    defaultMessage:
      'From {startDate, time, ::yyyyMMdd} to {endDate, time, ::yyyyMMdd}',
  },
  startDate: {
    id: 'ReactFilters.DateRangeFilter.startDate',
    defaultMessage: 'Start',
  },
  endDate: {
    id: 'ReactFilters.DateRangeFilter.endDate',
    defaultMessage: 'End',
  },
});

const subscription = { value: true };

// For display (store -> form)
function formatValue(value) {
  if (value === undefined) {
    return [
      {
        startDate: null,
        endDate: null,
        key: 'selection',
      },
    ];
  }

  if (Array.isArray(value)) {
    return value.map(v => ({
      ...v,
      startDate: v.gte,
      endDate: v.lte,
    }));
  }

  if (typeof value === 'object') {
    return [
      {
        startDate: value.gte,
        endDate: value.lte,
        key: 'selection',
      },
    ];
  }

  return value;
}

// For save (form -> store)
function parseValue(value) {
  const [selection] = value;

  if (selection.startDate === null && selection.endDate === null) {
    return undefined;
  }

  return {
    gte: selection.startDate,
    lte: selection.endDate ? endOfDay(selection.endDate) : selection.endDate,
  };
}

function DefaultPreviewRenderer({
  label,
  onRemove,
  disabled,
  className
}) {
  return (
    <span className={className}>
      <ValueBadge
        label={label}
        onRemove={onRemove}
        disabled={disabled}
      />
    </span>
  );
}

function Preview({
  name,
  staticRanges,
  component = DefaultPreviewRenderer,
  ...rest
}) {
  const intl = useIntl();
  const { input } = useField(name, { subscription });

  const selectedStaticRange = useMemo(() => {
    const formattedValue = formatValue(input.value)[0];
    return staticRanges.find(v => v.isSelected(formattedValue));
  }, [input.value, staticRanges]);

  const singleDay = useMemo(
    () => input.value?.gte
      && input.value?.lte
      && isSameDay(input.value.gte, input.value.lte),
    [input.value]
  );

  const onRemove = useCallback(
    e => {
      e.stopPropagation();

      input.onChange(undefined);
    },
    [input]
  );

  let label;

  if (!input.value || input.value === '') {
    return null;
  }

  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else {
    label = singleDay
      ? intl.formatMessage(messages.singleDate, { date: input.value.gte })
      : intl.formatMessage(messages.dateRange, {
        startDate: input.value.gte,
        endDate: input.value.lte,
      });
  }

  return React.createElement(
    component,
    {
      name,
      staticRanges,
      label,
      onRemove,
      ...rest
    }
  );
}

function Title({
  name,
  filter,
  staticRanges,
  disabled
}) {
  const title = useFilterTitle(name, filter.fieldSchema);
  const { input } = useField(name, { subscription });

  if (!input.value || input.value === '') {
    return <div>{title}</div>;
  }

  return (
    <div className="flex-auto">
      {title}
      <Preview
        name={name}
        filter={filter}
        title={title}
        staticRanges={staticRanges}
        disabled={disabled}
        className="oa-filter-value-preview"
      />
    </div>
  );
}

function DateRangeFilter({
  name,
  filter,
  disabled,
  staticRanges,
  inputRanges
}) {
  const intl = useIntl();
  const form = useForm();

  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 1);

  return (
    <Panel
      header={(
        <Title
          name={name}
          filter={filter}
          staticRanges={staticRanges}
          disabled={disabled}
        />
      )}
    >
      <Field
        name={name}
        subscription={subscription}
        parse={parseValue}
        format={formatValue}
        component={DateRangePicker}
        staticRanges={staticRanges}
        inputRanges={inputRanges}
        startDatePlaceholder={intl.formatMessage(messages.startDate)}
        endDatePlaceholder={intl.formatMessage(messages.endDate)}
      />
      <OnChange name={name}>{onChange}</OnChange>
    </Panel>
  );
}

const exported = React.memo(DateRangeFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
