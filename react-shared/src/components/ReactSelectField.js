import React, { useCallback, useMemo, useRef } from 'react';
import { Field } from 'react-final-form';
import ReactSelectInput from './ReactSelectInput';

const getValue = arg => arg?.value ?? arg;

export default ({
  name,
  initialValue,
  options,
  isCreatable,
  onBlur,
  ...props
}) => {
  const selectRef = useRef(null);

  const findOption = useCallback(
    (opt, array = options, skipDefault = false) => {
      let result;

      if (Array.isArray(array)) {
        for (let i = 0; i < array.length; i++) {
          const v = array[i];

          if (Array.isArray(v.options)) {
            result = findOption(opt, v.options, true);
          } else if (v.value === opt) {
            result = v;
          }

          if (typeof result !== 'undefined') {
            return result;
          }
        }
      }

      if (result) {
        return result;
      }

      if (!skipDefault) {
        return { label: String(opt), value: opt };
      }
    },
    [options]
  );

  const format = useCallback(
    selectedOption => {
      if ([undefined, null, ''].includes(selectedOption)) {
        return null;
      }

      return Array.isArray(selectedOption)
        ? selectedOption.map(v => findOption(v))
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
    (e, ...args) => {
      if (isCreatable) {
        const {
          state: { inputValue, value },
        } = selectRef.current;

        const alreadyInValue = inputValue.length && value
          ? value?.some(v => v.value === inputValue)
          : !inputValue.length;

        if (!alreadyInValue) {
          selectRef.current.onChange([
            ...value,
            { label: inputValue, value: inputValue },
          ]);
        }
      }

      if (typeof onBlur === 'function') {
        return onBlur(e, ...args);
      }
    },
    [onBlur, isCreatable]
  );
  const isValidNewOption = useCallback(
    value => ![undefined, null, ''].includes(value),
    []
  );

  const initialOption = useMemo(() => initialValue ?? format(initialValue), [
    format,
    initialValue,
  ]);

  return (
    <Field
      name={name}
      innerRef={selectRef}
      component={ReactSelectInput}
      options={options}
      initialValue={initialOption}
      isCreatable={isCreatable}
      format={format}
      parse={parse}
      onBlur={handleBlur}
      isValidNewOption={isCreatable ? isValidNewOption : undefined}
      components={undefined}
      {...props}
    />
  );
};
