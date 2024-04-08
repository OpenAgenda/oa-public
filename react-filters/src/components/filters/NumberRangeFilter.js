import React, { useState, useCallback } from 'react';
import { Field, useField } from 'react-final-form';
import NumberRangeField from '../fields/NumberRangeField';
import Panel from '../Panel';
import Title from '../Title';
import FilterPreviewer from '../FilterPreviewer';

const subscription = { value: true };

const isDefined = v => ![undefined, null].includes(v);

function formatPreviewLabel(value) {
  if (!isDefined(value.gte) && isDefined(value.lte)) {
    return `≤ ${value.lte}`;
  }

  if (isDefined(value.gte) && !isDefined(value.lte)) {
    return `≥ ${value.gte}`;
  }

  if (isDefined(value.gte) && isDefined(value.lte)) {
    return `${value.gte} ≤ ${value.lte}`;
  }
}

function Preview({
  name,
  component = FilterPreviewer,
  disabled,
  ...rest
}) {
  const { input } = useField(name, { subscription });

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

  if (!input.value?.gte && !input.value?.lte) {
    return null;
  }

  return React.createElement(component, {
    name,
    label: formatPreviewLabel(input.value),
    onRemove,
    disabled,
    ...rest,
  });
}

const NumberRangeFilter = React.forwardRef(function NumberRangeFilter(
  {
    name,
  },
  ref,
) {
  return (
    <Field
      ref={ref}
      name={name}
      subscription={subscription}
      parse={({ lte, gte }) => ({
        lte: isDefined(lte) && lte.length ? parseInt(lte, 10) : null,
        gte: isDefined(gte) && gte.length ? parseInt(gte, 10) : null,
      })}
      format={v => (v === undefined ? { lte: null, gte: null } : v)}
      component={NumberRangeField}
    />
  );
});

const Collapsable = React.forwardRef(function Collapsable(
  {
    name,
    filter,
    component,
    disabled,
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
          disabled={disabled}
        />
      )}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      <NumberRangeFilter
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

const exported = React.memo(NumberRangeFilter);

exported.Preview = Preview;
exported.Collapsable = Collapsable;

export default exported;
