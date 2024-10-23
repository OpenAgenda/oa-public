import React, { useState } from 'react';
import { Field } from 'react-final-form';
import { endOfDay, startOfDay, format } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
// import NumberRangeField from '../fields/NumberRangeField';
import Panel from '../Panel';
import Title from '../Title';
import SimpleDateRangeField from '../fields/SimpleDateRangeField';
import { Preview } from './DateRangeFilter';

const subscription = { value: true };

function formatDateValue(value, tz) {
  if (!value) return value;

  const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzDiff = getTimezoneOffset(tz, value) - getTimezoneOffset(currentTz, value);

  let date = new Date(value);

  if (tzDiff) {
    date = utcToZonedTime(date, tz);
  }

  return date;
}

// For display (store -> form)
function formatValue(value) {
  if (!value) {
    return undefined;
  }

  const gte = formatDateValue(value.gte, value.tz);
  const lte = formatDateValue(value.lte, value.tz);

  return {
    gte: gte ? format(gte, 'yyyy-MM-dd') : null,
    lte: lte ? format(lte, 'yyyy-MM-dd') : null,
  };
}

// For save (form -> store)
function parseValue(value) {
  if (!value) {
    return value;
  }

  const gte = value.gte ? startOfDay(new Date(value.gte)).toISOString() : null;
  const lte = value.lte ? endOfDay(new Date(value.lte)).toISOString() : null;

  const result = {};
  if (gte) result.gte = gte;
  if (lte) result.lte = lte;

  if (gte || lte) result.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return result;
}

const SimpleDateRangeFilter = React.forwardRef(function SimpleDateRangeFilter(
  { name },
  ref,
) {
  return (
    <Field
      ref={ref}
      name={name}
      subscription={subscription}
      format={formatValue}
      parse={parseValue}
      component={SimpleDateRangeField}
    />
  );
});

const Collapsable = React.forwardRef(function Collapsable(
  { name, filter, component, disabled, staticRanges, inputRanges, ...rest },
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
          disabled={disabled}
        />
      )}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      <SimpleDateRangeFilter
        ref={ref}
        name={name}
        filter={filter}
        component={component}
        disabled={disabled}
        collapsed={collapsed}
        {...rest}
      />
    </Panel>
  );
});

const exported = React.memo(SimpleDateRangeFilter);

exported.Preview = Preview;
exported.Collapsable = Collapsable;

export default exported;
