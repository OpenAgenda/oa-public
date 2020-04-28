import React, { useCallback, useMemo, useRef } from 'react';
import { Field } from 'react-final-form';
import ReactSelectInput from './ReactSelectInput';

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
      components={undefined}
      {...props}
    />
  );
};
