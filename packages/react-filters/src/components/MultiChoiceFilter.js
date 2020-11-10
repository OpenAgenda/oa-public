import React, { useCallback, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { useIntl } from 'react-intl';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import cn from 'classnames';
import useFilterTitle from '../hooks/useFilterTitle';
import getLocaleValue from '../utils/getLocaleValue';
import Panel from './Panel';

const titleSubscription = { value: true };
const fieldSubscription = { value: true, submitting: true };

function parseValue(value) {
  if (Array.isArray(value) && !value.length) {
    return undefined;
  }

  return value;
}

function formatValue(value) {
  return value;
}

function Title({ input, options, label }) {
  const intl = useIntl();
  const title = useFilterTitle(input.name, { label });

  const values = useMemo(
    () => input.value
      && input.value.map(v => getLocaleValue(options.find(option => option.value === v).label)),
    [input.value, options]
  );

  const { onChange } = input;

  const onReset = useCallback(
    e => {
      e.stopPropagation();
      onChange(undefined);
    },
    [onChange]
  );

  if (!values) {
    return <div>{title}</div>;
  }

  const resetButton = (
    <div className="pull-right">
      <button
        type="button"
        className="btn btn-link btn-link-inline"
        onClick={onReset}
      >
        <i className="fa fa-trash text-danger" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <div className="flex-auto">
      {resetButton}
      {title} - {intl.formatList(values)}
    </div>
  );
}

function Checkbox({ input, meta, option }) {
  const seed = useUIDSeed();

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
      </label>
    </div>
  );
}

function MultiChoiceFilter({ name, options, filter }) {
  const form = useForm();
  const seed = useUIDSeed();

  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 1);

  return (
    <Panel
      header={(
        <Field
          name={name}
          subscription={titleSubscription}
          component={Title}
          options={options}
          label={filter.label}
        />
      )}
    >
      {options.map(option => (
        <Field
          key={seed(option)}
          name={name}
          subscription={fieldSubscription}
          parse={parseValue}
          format={formatValue}
          component={Checkbox}
          type="checkbox"
          value={option.value}
          option={option}
        />
      ))}
      <OnChange name={name}>{onChange}</OnChange>
    </Panel>
  );
}

export default React.memo(MultiChoiceFilter);
