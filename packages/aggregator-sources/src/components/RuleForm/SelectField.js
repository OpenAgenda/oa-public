import { useIntl } from 'react-intl';
import { Field } from 'react-final-form';

import React, { useCallback, useMemo, useRef } from 'react';

import ReactSelectInput from './ReactSelectInput';
import styles from './selectStyles';
import messages from './messages';

export default ({
  name,
  initialValue,
  options,
  creatable,
  onBlur,
  ...props
}) => {
  const intl = useIntl();
  const selectRef = useRef(null);

  const format = useCallback(
    selectedOption => {
      if ([undefined, null, ''].includes(selectedOption)) {
        return null;
      }

      const findOption = opt => options?.find(v => v.value === opt) ?? { label: opt, value: opt };

      return Array.isArray(selectedOption)
        ? selectedOption.map(findOption)
        : findOption(selectedOption);
    },
    [options]
  );
  const parse = useCallback(value => {
    if (value === '') {
      return undefined;
    }

    const getValue = arg => arg?.value ?? arg;

    return Array.isArray(value) ? value.map(getValue) : getValue(value);
  }, []);
  const formatCreateLabel = useCallback(
    value => intl.formatMessage(messages.createOption, { value }),
    [intl]
  );
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

  const components = useMemo(() => undefined, []);

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
      formatCreateLabel={formatCreateLabel}
      onBlur={handleBlur}
      isValidNewOption={creatable ? isValidNewOption : undefined}
      styles={styles}
      components={components}
      {...props}
    />
  );
};
