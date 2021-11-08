import React, { useCallback, useMemo, useState } from 'react';
import { Field, useField } from 'react-final-form';
import { defineMessages, useIntl } from 'react-intl';
import { parseISO, endOfDay, isSameDay } from 'date-fns';
import useFilterTitle from '../../hooks/useFilterTitle';
import DefinedRangePicker from '../fields/DefinedRangeField';
import { dateRanges } from '../../utils';
import Panel from '../Panel';
import FilterPreviewer from '../FilterPreviewer';

const messages = defineMessages({
  singleDate: {
    id: 'ReactFilters.DefinedRangeFilter.singleDate',
    defaultMessage: '{date, time, ::yyyyMMdd}',
  },
  dateRange: {
    id: 'ReactFilters.DefinedRangeFilter.dateRange',
    defaultMessage:
      'From {startDate, time, ::yyyyMMdd} to {endDate, time, ::yyyyMMdd}',
  },
  startDate: {
    id: 'ReactFilters.DefinedRangeFilter.startDate',
    defaultMessage: 'Start',
  },
  endDate: {
    id: 'ReactFilters.DefinedRangeFilter.endDate',
    defaultMessage: 'End',
  },
  until: {
    id: 'ReactFilters.DefinedRangeFilter.until',
    defaultMessage: 'Until {date, time, ::yyyyMMdd}',
  },
  from: {
    id: 'ReactFilters.DefinedRangeFilter.from',
    defaultMessage: 'From {date, time, ::yyyyMMdd}',
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
      startDate: typeof v.gte === 'string' ? parseISO(v.gte) : v.gte,
      endDate: typeof v.lte === 'string' ? parseISO(v.lte) : v.lte,
    }));
  }

  if (typeof value === 'object') {
    return [
      {
        startDate: typeof value.gte === 'string' ? parseISO(value.gte) : value.gte,
        endDate: typeof value.lte === 'string' ? parseISO(value.lte) : value.lte,
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
  const { input } = useField(name, { subscription, parse: parseValue, format: formatValue });
  const value = input.value?.[0];

  const selectedStaticRange = useMemo(
    () => value && staticRanges.find(v => v.isSelected(value)),
    [value, staticRanges]
  );

  const singleDay = useMemo(
    () => value?.startDate
      && value?.endDate
      && isSameDay(value.startDate, value.endDate),
    [value]
  );

  const onRemove = useCallback(
    e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      input.onChange(undefined);
    },
    [input, disabled]
  );

  let label;

  if (!value?.startDate && !value?.endDate) {
    return null;
  }

  if (selectedStaticRange) {
    label = selectedStaticRange.label;
  } else if (value.startDate === null) {
    label = intl.formatMessage(messages.until, { date: value.endDate });
  } else if (value.endDate === null) {
    label = intl.formatMessage(messages.from, { date: value.startDate });
  } else {
    label = singleDay
      ? intl.formatMessage(messages.singleDate, { date: value.startDate })
      : intl.formatMessage(messages.dateRange, {
        startDate: value.startDate,
        endDate: value.endDate,
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

function Title({
  name, filter, staticRanges, disabled
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

const DefinedRangeFilter = React.forwardRef(function DefinedRangeFilter(
  {
    name,
    staticRanges: staticRangesProp,
    inputRanges
  },
  ref
) {
  const intl = useIntl();
  const { staticRanges } = useMemo(() => dateRanges(intl, {
    staticRanges: staticRangesProp,
    inputRanges
  }), [inputRanges, intl, staticRangesProp]);

  return (
    <>
      <Field
        ref={ref}
        name={name}
        subscription={subscription}
        parse={parseValue}
        format={formatValue}
        component={DefinedRangePicker}
        staticRanges={staticRanges}
        inputRanges={inputRanges}
      />
    </>
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
  ref
) {
  const [collapsed, setCollapsed] = useState(true);

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
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      <DefinedRangeFilter
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

const exported = React.memo(DefinedRangeFilter);

// React.memo lose statics
exported.Preview = Preview;
exported.Collapsable = Collapsable;

export default exported;
