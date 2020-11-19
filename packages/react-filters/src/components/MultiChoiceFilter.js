import React, { useCallback, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import cn from 'classnames';
import useFilterTitle from '../hooks/useFilterTitle';
import getLocaleValue from '../utils/getLocaleValue';
import Panel from './Panel';

const subscription = { value: true, submitting: true };

function parseValue(value) {
  if (Array.isArray(value) && !value.length) {
    return undefined;
  }

  return value;
}

function formatValue(value) {
  return value;
}

function ValuePreview({ option, input, meta }) {
  const label = useMemo(() => getLocaleValue(option.label), [option.label]);

  const removeValue = useCallback(
    e => {
      e.stopPropagation();

      input.onChange(input.value.filter(v => v !== option.value));
    },
    [input, option.value]
  );

  return (
    <div className="badge badge-info">
      {label}
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
  input, meta, options, label
}) {
  const title = useFilterTitle(input.name, { label });

  const valueOptions = useMemo(
    () => input.value
      && input.value.map(v => options.find(option => option.value === v)),
    [input.value, options]
  );

  if (!valueOptions) {
    return <div>{title}</div>;
  }

  return (
    <div className="flex-auto">
      {title}
      <div className="oa-filter-value-preview">
        {valueOptions.map(option => (
          <ValuePreview option={option} input={input} meta={meta} />
        ))}
      </div>
    </div>
  );
}

function Checkbox({
  input, meta, getTotal, filter, option
}) {
  const seed = useUIDSeed();
  const total = useMemo(() => getTotal && getTotal(filter, option), [
    filter,
    getTotal,
    option,
  ]);

  return (
    <div className={cn('checkbox', { disabled: meta.submitting })}>
      <label htmlFor={seed(input.value)}>
        <input
          type="checkbox"
          id={seed(input.value)}
          disabled={meta.submitting}
          {...input}
        />{' '}
        {getLocaleValue(option.label)}
        {total ? <span className="oa-filter-total">{total}</span> : null}
      </label>
    </div>
  );
}

function MultiChoiceFilter({
  name, options, label, filter, getTotal
}) {
  const form = useForm();
  const seed = useUIDSeed();

  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 1);

  return (
    <Panel
      header={(
        <Field
          name={name}
          subscription={subscription}
          component={Title}
          options={options}
          label={label}
        />
      )}
    >
      {options.map(option => (
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
        />
      ))}
      <OnChange name={name}>{onChange}</OnChange>
    </Panel>
  );
}

export default React.memo(MultiChoiceFilter);
