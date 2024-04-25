import { useMemo, useCallback } from 'react';
import ReactSelect, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';

const BLUE = '#41acdd';
const WHITE = '#fff';
const GRAY = '#ccc';
const LIGHTGRAY = '#f8f8f8';
const BLACK = '#333';

const defaultStyles = {
  clearIndicator: provided => ({
    ...provided,
    padding: '5px',
    cursor: 'pointer',
  }),
  control: (provided, { isFocused }) => ({
    ...provided,
    minHeight: '35px',
    borderColor: GRAY,
    ...isFocused
      ? {
        borderColor: '#66afe9',
        outline: '0',
        WebkitBoxShadow:
            'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)',
        boxShadow:
            'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)',
      }
      : {},

    '&:hover': {
      borderColor: isFocused ? '#66afe9' : GRAY,
    },
  }),
  dropdownIndicator: provided => ({
    ...provided,
    padding: '5px',
    cursor: 'pointer',
  }),
  indicatorsContainer: (base, state) =>
    (state.selectProps.isCreatable && !state.selectProps.options?.length
      ? {
        display: 'none',
      }
      : base),
  menu: (base, state) =>
    (state.selectProps.isCreatable && !state.selectProps.options?.length
      ? {
        display: 'none',
      }
      : base),
  multiValue: provided => ({
    ...provided,
    margin: '1px',
    padding: '0px',
    borderRadius: '2px',
    overflow: 'hidden',
  }),
  multiValueLabel: provided => ({
    ...provided,
    fontSize: '100%',
    padding: '3px',
    paddingLeft: '5px',
    paddingRight: '0',
    backgroundColor: BLUE,
    color: WHITE,
    borderRadius: '0',
  }),
  multiValueRemove: provided => ({
    ...provided,
    cursor: 'pointer',
    backgroundColor: BLUE,
    color: WHITE,
    borderRadius: '0',
    '&:hover': {
      backgroundColor: BLUE,
      color: WHITE,
    },
  }),
  option: (provided, state) => {
    let backgroundColor = WHITE;
    if (state.isSelected) {
      backgroundColor = BLUE;
    } else if (state.isFocused) {
      backgroundColor = LIGHTGRAY;
    }
    return {
      ...provided,
      pointer: 'cursor',
      color: state.isSelected ? WHITE : BLACK,
      backgroundColor,
    };
  },
  valueContainer: provided => ({
    ...provided,
    padding: '2px 4px',
  }),
};

function Option({ innerProps, ...props }) {
  const onClick = e => {
    e.nativeEvent.stopImmediatePropagation();
    innerProps.onClick(e);
  };

  props.innerProps = { ...innerProps, onClick };
  return <components.Option {...props} />;
}

const defaultComponents = {
  Option,
};

const spreadValue = (value, separator) =>
  value.reduce((spread, item) => {
    if (item.value.split(separator).length === 1) {
      return spread.concat(item);
    }
    return spread.concat(
      item.value
        .split(separator)
        .map(v => v.trim())
        .map(v => ({
          value: v,
          label: v,
        })),
    );
  }, []);

function ReactSelectInput({
  innerRef,
  isCreatable,
  input,
  meta,
  styles: stylesProp,
  isMulti,
  separator,
  ...rest
}) {
  const SelectComponent = isCreatable ? CreatableSelect : ReactSelect;
  const styles = useMemo(
    () => ({
      ...defaultStyles,
      ...stylesProp,
    }),
    [stylesProp],
  );
  const onChangeProp = rest.onChange || input.onChange;

  const onChange = useCallback(
    value => {
      if (!onChangeProp) {
        return;
      }

      onChangeProp(
        separator && isMulti && isCreatable
          ? spreadValue(value, separator)
          : value,
      );
    },
    [onChangeProp, separator, isCreatable, isMulti],
  );

  return (
    <>
      <SelectComponent
        ref={innerRef}
        {...input}
        isCreatable={isCreatable}
        isClearable={!isCreatable}
        isMulti={isMulti}
        styles={styles}
        components={defaultComponents}
        onChange={onChange}
        {...rest}
      />

      {!meta?.dirtySinceLastSubmit && meta?.submitError ? (
        <div className="margin-top-xs margin-bottom-sm text-danger">
          {meta.submitError}
        </div>
      ) : null}
    </>
  );
}

ReactSelectInput.defaultStyles = defaultStyles;

export default ReactSelectInput;
