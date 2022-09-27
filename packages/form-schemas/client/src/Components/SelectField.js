import React, { useState, useCallback } from 'react';
import { ReactSelectInput } from '@openagenda/react-shared';

import labels from '@openagenda/labels/form-schemas/index';
import flattenLabels from '@openagenda/labels/flatten';

const getSelectOptions = (field, opts = {}) => {
  const {
    value
  } = opts;
  const { options } = field;

  return options.filter(o => {
    if (!o.display) {
      return false;
    }
    if (!value) {
      return true;
    }
    return [].concat(value).includes(o.id);
  }).map(o => ({
    value: o.id,
    label: o.label,
    info: o.info
  }));
};

const getCurrentValue = ({ isFresh, field, value }) => {
  if (value) {
    return getSelectOptions(field, { value });
  }

  if (isFresh && field.default) {
    return getSelectOptions(field, { value: field.default });
  }
};

/* function Option({ innerProps, ...props }) {
  const onClick = e => {
    e.nativeEvent.stopImmediatePropagation();
    innerProps.onClick(e);
  };

  props.innerProps = { ...innerProps, onClick };
  return <components.Option {...props} />;
} */

const Option = props => {
  const {
    className,
    cx,
    getStyles,
    isDisabled,
    isFocused,
    isSelected,
    innerRef,
    innerProps,
    data
  } = props;

  const {
    label,
    info
  } = data;

  return (
    <div
      style={getStyles('option', props)}
      className={cx(
        {
          option: true,
          'option--is-disabled': isDisabled,
          'option--is-focused': isFocused,
          'option--is-selected': isSelected,
        },
        className
      )}
      ref={innerRef}
      aria-disabled={isDisabled}
      {...innerProps}
    >
      <div>{label}</div>
      {info && <div className={cx({ 'text-muted': !isSelected })}>{info}</div>}
    </div>
  );
};

export default function SelectField(props) {
  const {
    onChange: propsOnChange,
    field,
    value,
    lang,
    isMulti
  } = props;

  const [isFresh, setIsFresh] = useState(true);

  const onChange = useCallback(selected => {
    setIsFresh(false);

    if (selected === null) {
      propsOnChange(isMulti ? [] : undefined);
      return;
    }

    propsOnChange(isMulti ? selected.map(o => o.value) : selected.value);
  }, [propsOnChange, isMulti]);

  const {
    noOption,
    selectPlaceholder: defaultSelectPlaceholder
  } = flattenLabels(labels, lang);

  return (
    <ReactSelectInput
      value={getCurrentValue({ isFresh, field, value })}
      options={getSelectOptions(field)}
      onChange={onChange}
      isClearable={!isMulti && field.optional}
      noOptionsMessage={() => noOption}
      isMulti={isMulti}
      components={{ Option }}
      placeholder={field.placeholder || defaultSelectPlaceholder}
    />
  );
}
