import React, { useCallback, useMemo, useRef } from 'react';
import ReactSelectInput from './ReactSelectInput';

const getValue = arg => arg?.value ?? arg;

function WrappedReactSelectInput({ defaultOption, ...props }) {
  const { value } = props.input;

  return (
    <ReactSelectInput
      {...props}
      value={value && value !== '' ? value : defaultOption}
    />
  );
}

function ReactSelectField({
  Field,
  name,
  initialValue,
  defaultValue,
  options,
  isCreatable,
  onBlur,
  ...props
}) {
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

  const defaultOption = useMemo(
    () => (defaultValue !== undefined && defaultValue !== ''
      ? format(defaultValue)
      : defaultValue),
    [
      format,
      defaultValue,
    ],
  );

  return (
    <Field
      name={name}
      innerRef={selectRef}
      component={WrappedReactSelectInput}
      options={options}
      initialValue={initialValue}
      defaultOption={defaultOption} // defaultValue is already used by reactFinalForm
      isCreatable={isCreatable}
      format={format}
      parse={parse}
      onBlur={handleBlur}
      isValidNewOption={isCreatable ? isValidNewOption : undefined}
      components={undefined}
      {...props}
    />
  );
}

ReactSelectField.defaultStyles = ReactSelectInput.defaultStyles;

export default ReactSelectField;
