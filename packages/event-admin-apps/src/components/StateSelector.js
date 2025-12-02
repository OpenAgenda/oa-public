import { useMemo } from 'react';
import { ReactSelectInput, EventState } from '@openagenda/react-shared';

const { defaultStyles: defaultReactSelectStyles } = ReactSelectInput;

const stateSelectStyles = {
  ...defaultReactSelectStyles,
  container: (provided) => ({
    ...provided,
    display: 'inline-block',
  }),
  control: (provided, state) => ({
    ...defaultReactSelectStyles.control(provided, state),
    transition: 'none',
    border: 'none',
    WebkitBoxShadow: 'none',
    boxShadow: 'none',
    cursor: 'pointer',
    minWidth: 0,
    minHeight: 0,
  }),
  valueContainer: (provided, state) => ({
    ...defaultReactSelectStyles.valueContainer(provided, state),
    padding: 0,
  }),
  singleValue: (provided) => ({
    ...provided,
    top: 0,
    transform: 'none',
    position: 'relative',
    overflow: 'visible',
    marginRight: 0,
  }),
  option: (provided) => ({
    ...provided,
    cursor: 'pointer',
    display: 'flex',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 0,
    verticalAlign: 'middle',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided, state) => ({
    ...defaultReactSelectStyles.menu(provided, state),
    minWidth: '150px',
  }),
  placeholder: (provided) => ({
    ...provided,
    position: 'relative',
    transform: 'none',
    top: 0,
  }),
};

export default function StateSelector({
  value,
  onChange,
  isEventValid = true,
  ...otherProps
}) {
  const stateOptions = useMemo(
    () =>
      [-1, 0, 1, 2].map((v) => ({
        label: <EventState value={v} />,
        value: v,
        isDisabled: !isEventValid && v === 2,
      })),
    [isEventValid],
  );

  const selectValue = useMemo(
    () => stateOptions.find((o) => o.value === value),
    [value, stateOptions],
  );

  return (
    <ReactSelectInput
      options={stateOptions}
      value={selectValue}
      onChange={onChange}
      styles={stateSelectStyles}
      isSearchable={false}
      isClearable={false}
      {...otherProps}
    />
  );
}
