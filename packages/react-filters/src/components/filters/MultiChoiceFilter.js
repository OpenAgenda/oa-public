import React, { useCallback, useMemo, useState } from 'react';
import { Field, useForm, useField } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import useFilterTitle from '../../hooks/useFilterTitle';
import Checkbox from '../fields/Checkbox';
import Panel from '../Panel';
import ValueBadge from '../ValueBadge';

const OPTIONS_PAGE_SIZE = 10;

const subscription = { value: true };

function parseValue(value) {
  if (Array.isArray(value) && !value.length) {
    return undefined;
  }

  return value;
}

function formatValue(value) {
  return value;
}

function DefaultPreviewRenderer({
  valueOptions,
  onRemove,
  disabled,
  className,
}) {
  return (
    <span className={className}>
      {valueOptions.map(option => (
        <ValueBadge
          key={option.value}
          label={option.label}
          onRemove={onRemove(option)}
          disabled={disabled}
        />
      ))}
    </span>
  );
}

function Preview({
  name,
  filter,
  getOptions,
  component = DefaultPreviewRenderer,
  disabled,
  ...rest
}) {
  const { input } = useField(name, { subscription });
  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

  const valueOptions = useMemo(
    () => input.value
      && input.value.map(v => options.find(option => option.value === v)),
    [input.value, options]
  );

  const onRemove = useCallback(
    option => e => {
      e.stopPropagation();

      if (disabled) {
        return;
      }

      const newValue = input.value.filter(v => v !== option.value);

      input.onChange(newValue.length ? newValue : undefined);
    },
    [input, disabled]
  );

  if (!valueOptions || valueOptions === '') {
    return null;
  }

  return React.createElement(component, {
    name,
    filter,
    getOptions,
    valueOptions,
    onRemove,
    disabled,
    ...rest,
  });
}

function Title({
  name, filter, getOptions, disabled
}) {
  const title = useFilterTitle(name, filter.fieldSchema);
  const field = useField(name, { subscription });

  const { input } = field;

  if (!input.value?.length) {
    return <div>{title}</div>;
  }

  return (
    <div className="flex-auto">
      {title}
      <Preview
        name={name}
        filter={filter}
        title={title}
        getOptions={getOptions}
        disabled={disabled}
        className="oa-filter-value-preview"
      />
    </div>
  );
}

function MultiChoiceFilter({
  name, filter, getTotal, getOptions, disabled
}) {
  const form = useForm();
  const seed = useUIDSeed();
  const [maxOptions, setMaxOptions] = useState(OPTIONS_PAGE_SIZE);
  const [collapsed, setCollapsed] = useState(true);

  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 1);

  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

  const moreOptions = useCallback(
    () => setMaxOptions(v => v + OPTIONS_PAGE_SIZE),
    []
  );
  const lessOptions = useCallback(() => setMaxOptions(OPTIONS_PAGE_SIZE), []);

  const onCollapsedChange = useCallback(
    value => {
      setCollapsed(value);

      if (value) {
        lessOptions();
      }
    },
    [lessOptions]
  );

  const hasMoreOptions = maxOptions < options.length;

  return (
    <Panel
      header={(
        <Title
          name={name}
          filter={filter}
          getOptions={getOptions}
          disabled={disabled}
        />
      )}
      collapsed={collapsed}
      setCollapsed={onCollapsedChange}
    >
      {options.map((option, index) => (index < maxOptions ? (
        <Field
          key={seed(option)}
          name={name}
          subscription={subscription}
          parse={parseValue}
          format={formatValue}
          component={Checkbox}
          type="checkbox"
          value={option.value}
          option={option}
          filter={filter}
          getTotal={getTotal}
          disabled={disabled}
        />
      ) : null))}

      {hasMoreOptions ? (
        <button
          type="button"
          className="btn btn-link btn-link-inline"
          onClick={moreOptions}
        >
          Plus d&apos;options
        </button>
      ) : null}

      {!hasMoreOptions && maxOptions > OPTIONS_PAGE_SIZE ? (
        <button
          type="button"
          className="btn btn-link btn-link-inline"
          onClick={lessOptions}
        >
          Moins d&apos;options
        </button>
      ) : null}

      <OnChange name={name}>{onChange}</OnChange>
    </Panel>
  );
}

const exported = React.memo(MultiChoiceFilter);

// React.memo lose statics
exported.Preview = Preview;

export default exported;
