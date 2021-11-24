import React, { useCallback, useState } from 'react';
import { Field, useField } from 'react-final-form';
import { defineMessages, useIntl } from 'react-intl';
import LoadableMapField from '../fields/LoadableMapField';
import Panel from '../Panel';
import useFilterTitle from '../../hooks/useFilterTitle';
import FilterPreviewer from '../FilterPreviewer';

const subscription = { value: true };

const messages = defineMessages({
  previewLabel: {
    id: 'ReactFilters.filters.MapFilter.previewLabel',
    defaultMessage: 'Map',
  },
});

function Preview({
  name,
  filter,
  component = FilterPreviewer,
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

function Title({ name, filter, disabled }) {
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
        disabled={disabled}
        className="oa-filter-value-preview"
      />
    </div>
  );
}

function MapFilter({
  name,
  filter,
  disabled,
  collapsed,
  className,
  ...rest
}, ref) {
  return (
    <>
      <Field
        collapsed={collapsed}
        ref={ref}
        name={name}
        subscription={subscription}
        component={LoadableMapField}
        filter={filter}
        disabled={disabled}
        className={className}
        {...rest}
      />
    </>
  );

  // return <LoadableMapField ref={ref} {...props} />;
}

const Collapsable = React.forwardRef(function Collapsable(
  {
    name,
    filter,
    disabled,
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
          disabled={disabled}
        />
      )}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
    >
      <MapFilter
        ref={ref}
        name={name}
        filter={filter}
        disabled={disabled}
        collapsed={collapsed}
        {...rest}
      />
    </Panel>
  );
});

const exported = React.memo(React.forwardRef(MapFilter));

// React.memo lose statics
exported.Preview = Preview;
exported.Collapsable = Collapsable;

export default exported;
