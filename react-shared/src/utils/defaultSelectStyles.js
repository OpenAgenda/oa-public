const BLUE = '#41acdd';
const WHITE = '#fff';
const GRAY = '#ccc';
const LIGHTGRAY = '#f8f8f8';
const BLACK = '#333';

export default {
  clearIndicator: (provided) => ({
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
  dropdownIndicator: (provided) => ({
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
  multiValue: (provided) => ({
    ...provided,
    margin: '1px',
    padding: '0px',
    borderRadius: '2px',
    overflow: 'hidden',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    fontSize: '100%',
    padding: '3px',
    paddingLeft: '5px',
    paddingRight: '0',
    backgroundColor: BLUE,
    color: WHITE,
    borderRadius: '0',
  }),
  multiValueRemove: (provided) => ({
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
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 4px',
  }),
};
