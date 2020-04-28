import React, { useCallback, useMemo, useRef } from 'react';
import { Field } from 'react-final-form';
import ReactSelectInput from './ReactSelectInput';

const styles = {
  control: (provided, { isFocused }) => ({
    ...provided,
    minHeight: '35px',
    borderColor: '#cccccc',
    ...(isFocused
      ? {
        borderColor: '#66afe9',
        outline: '0',
        WebkitBoxShadow:
            'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)',
        boxShadow:
            'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)'
      }
      : {}),

    '&:hover': {
      borderColor: isFocused ? '#66afe9' : '#cccccc'
    }
  }),
  valueContainer: provided => ({
    ...provided,
    padding: '2px 4px'
  }),
  dropdownIndicator: provided => ({
    ...provided,
    padding: '5px',
    cursor: 'pointer'
  }),
  clearIndicator: provided => ({
    ...provided,
    padding: '5px',
    cursor: 'pointer'
  }),
  multiValue: provided => ({
    ...provided,
    margin: '1px',
    padding: '0px',
    borderRadius: '2px',
    overflow: 'hidden'
  }),
  multiValueLabel: provided => ({
    ...provided,
    fontSize: '100%',
    padding: '3px',
    paddingLeft: '5px',
    paddingRight: '0',
    backgroundColor: '#41acdd',
    color: '#ffffff',
    borderRadius: '0'
  }),
  multiValueRemove: provided => ({
    ...provided,
    cursor: 'pointer',
    backgroundColor: '#41acdd',
    color: '#ffffff',
    borderRadius: '0',

    '&:hover': {
      backgroundColor: '#41acdd',
      color: '#ffffff'
    }
  }),
  menu: (base, state) => (state.selectProps.creatable && !state.selectProps.options?.length
    ? {
      display: 'none'
    }
    : base),
  indicatorsContainer: (base, state) => (state.selectProps.creatable && !state.selectProps.options?.length
    ? {
      display: 'none'
    }
    : base)
};

const getValue = arg => arg?.value ?? arg;

export default ({
  name,
  initialValue,
  options,
  creatable,
  onBlur,
  ...props
}) => {
  const selectRef = useRef(null);

  const findOption = useCallback(opt => options?.find(v => v.value === opt) ?? { label: opt, value: opt }, [options]);

  const format = useCallback(
    selectedOption => {
      if ([undefined, null, ''].includes(selectedOption)) {
        return null;
      }

      return Array.isArray(selectedOption)
        ? selectedOption.map(findOption)
        : findOption(selectedOption);
    },
    [findOption]
  );
  const parse = useCallback(value => {
    if (value === '') {
      return undefined;
    }

    return Array.isArray(value) ? value.map(getValue) : getValue(value);
  }, []);
  const handleBlur = useCallback(
    (...args) => {
      if (creatable) {
        const {
          state: { inputValue, value }
        } = selectRef.current;

        const alreadyInValue = inputValue.length && value
          ? value?.some(v => v.value === inputValue)
          : !inputValue.length;

        if (!alreadyInValue) {
          selectRef.current.onChange([
            ...value,
            { label: inputValue, value: inputValue }
          ]);
        }
      }

      if (typeof onBlur === 'function') {
        return onBlur(...args);
      }
    },
    [onBlur, creatable]
  );
  const isValidNewOption = useCallback(
    value => ![undefined, null, ''].includes(value),
    []
  );

  const initialOption = useMemo(() => initialValue ?? format(initialValue), [
    format,
    initialValue
  ]);

  return (
    <Field
      name={name}
      innerRef={selectRef}
      component={ReactSelectInput}
      options={options}
      initialValue={initialOption}
      creatable={creatable}
      format={format}
      parse={parse}
      onBlur={handleBlur}
      isValidNewOption={creatable ? isValidNewOption : undefined}
      styles={styles}
      components={undefined}
      {...props}
    />
  );
};
