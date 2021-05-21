import React, { useCallback, useState } from 'react';
import { Field, useField, useForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { defineMessages, useIntl } from 'react-intl';
import { useDebouncedCallback } from 'use-debounce';
import LoadableMapField from '../fields/LoadableMapField';
import Panel from '../Panel';
import useFilterTitle from '../../hooks/useFilterTitle';
import ValueBadge from '../ValueBadge';

const subscription = { value: true };

const messages = defineMessages({
  previewLabel: {
    id: 'ReactFilters.MapFilter.previewLabel',
    defaultMessage: 'Map',
  },
});

function DefaultPreviewRenderer({
  label, onRemove, disabled, className
}) {
  return (
    <span className={className}>
      <ValueBadge label={label} onRemove={onRemove} disabled={disabled} />
    </span>
  );
}

function Preview({
  name,
  filter,
  component = DefaultPreviewRenderer,
  disabled,
  ...rest
}) {
  const intl = useIntl();
  const { input } = useField(name, { subscription });

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

  if (!input.value || input.value === '') {
    return null;
  }

  return React.createElement(component, {
    name,
    filter,
    label: intl.formatMessage(messages.previewLabel),
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

function MapFilter(props, ref) {
  const { name, filter, disabled } = props;

  const form = useForm();

  const onChange = useDebouncedCallback(() => form.submit(), 1);

  const [collapsed, setCollapsed] = useState(true);

  return (
    <Panel
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      header={<Title name={name} filter={filter} disabled={disabled} />}
    >
      <Field
        collapsed={collapsed}
        ref={ref}
        name={name}
        subscription={subscription}
        component={LoadableMapField}
        {...props}
      />

      <OnChange name={name}>{onChange}</OnChange>
    </Panel>
  );

  // return <LoadableMapField ref={ref} {...props} />;
}

const exported = React.memo(React.forwardRef(MapFilter));

// React.memo lose statics
exported.Preview = Preview;

export default exported;
