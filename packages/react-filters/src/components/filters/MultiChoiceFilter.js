import React, { useCallback, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { useUIDSeed } from 'react-uid';
import { OnChange } from 'react-final-form-listeners';
import { useDebouncedCallback } from 'use-debounce';
import useFilterTitle from '../../hooks/useFilterTitle';
import getLocaleValue from '../../utils/getLocaleValue';
import Panel from '../Panel';
import Checkbox from '../fields/Checkbox';

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
          <ValuePreview
            key={option.value}
            option={option}
            input={input}
            meta={meta}
          />
        ))}
      </div>
    </div>
  );
}

function MultiChoiceFilter({
  name, label, filter, getTotal, getOptions
}) {
  const form = useForm();
  const seed = useUIDSeed();

  const { callback: onChange } = useDebouncedCallback(() => form.submit(), 1);

  const options = useMemo(() => getOptions(filter), [filter, getOptions]);

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
