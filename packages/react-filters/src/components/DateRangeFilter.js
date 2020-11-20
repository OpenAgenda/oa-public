import React, { useCallback, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { defineMessages, useIntl } from 'react-intl';
import { useDebouncedCallback } from 'use-debounce';
import { endOfDay, isSameDay } from 'date-fns';
import useFilterTitle from '../hooks/useFilterTitle';
import dateRanges from '../dateRanges';
import Panel from './Panel';
import DateRangePicker from './DateRangePicker';

const messages = defineMessages({
  singleDate: {
    id: 'ReactShared.DateRangeFilter.singleDate',
    defaultMessage: '{date, time, ::yyyyMMdd}',
  },
  dateRange: {
    id: 'ReactShared.DateRangeFilter.dateRange',
    defaultMessage:
      'From {startDate, time, ::yyyyMMdd} to {endDate, time, ::yyyyMMdd}',
  },
});

const subscription = { value: true, submitting: true };

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
function ValuePreview({ value, input, meta }) {
  const removeValue = useCallback(
    e => {
      e.stopPropagation();

      input.onChange(undefined);
    },
    [input]
  );

  return (
    <div className="badge badge-info">
      {value}
      <button
        type="button"
        className="btn btn-link btn-link-inline margin-left-xs"
        disabled={meta.submitting}
        onClick={removeValue}
      >
        <i className="fa fa-times" aria-hidden="true" />
      </button>
    </div>
  );
}

function Title({
  input, meta, staticRanges, label
}) {
  const intl = useIntl();
  const title = useFilterTitle(input.name, { label });

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

  if (!input?.value) {
    return <div>{title}</div>;
  }

  let value;

  if (selectedStaticRange) {
    value = selectedStaticRange.label;
  } else {
    value = singleDay
      ? intl.formatMessage(messages.singleDate, { date: input.value.gte })
      : intl.formatMessage(messages.dateRange, {
        startDate: input.value.gte,
        endDate: input.value.lte,
      });
  }

  return (
    <div className="flex-auto">
      {title}
      <div className="oa-filter-value-preview">
        <ValuePreview value={value} input={input} meta={meta} />
      </div>
    </div>
  );
}

function DateRangeFilter({ name }) {
  const intl = useIntl();
  const form = useForm();

  const { staticRanges, inputRanges } = useMemo(() => dateRanges(intl), [intl]);

  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 1);

  return (
    <Panel
      header={(
        <Field
          name={name}
          subscription={subscription}
          component={Title}
          staticRanges={staticRanges}
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
      />
      <OnChange name={name}>{onChange}</OnChange>
    </Panel>
  );
}

export default React.memo(DateRangeFilter);
