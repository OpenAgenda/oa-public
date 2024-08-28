import { useMemo, useCallback } from 'react';
import ReactSelect, { components } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import defaultStyles from '../utils/defaultSelectStyles';

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
