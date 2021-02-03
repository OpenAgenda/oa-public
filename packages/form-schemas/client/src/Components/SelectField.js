import React, { Component } from 'react';
import { ReactSelectInput } from '@openagenda/react-shared';

import labels from '@openagenda/labels/form-schemas/index';
import flattenLabels from '@openagenda/labels/flatten';

const blue = '#41acdd';
const black = '#333';
const lightGray = '#f8f8f8';

const getSelectOptions = (field, opts = {}) => {
  const {
    value
  } = opts;
  const options = field.options;

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
    label: o.label
  }));
}

export default class SelectField extends Component {
  constructor(props) {
    super(props);
    this.state = { isFresh: true };
  }
  onChange(selected) {
    const {
      isMulti
    } = this.props;

    this.setState({
      isFresh: false
    });

    if (selected === null) {
      this.props.onChange(isMulti ? [] : undefined);
    } else {
      this.props.onChange(isMulti ? selected.map(o => o.value) : selected.value);
    }
  }
  getCurrentValue() {
    const {
      isFresh
    } = this.state;
    const {
      field,
      value
    } = this.props;

    if (value) {
      return getSelectOptions(field, { value });
    }

    if (isFresh && field.default) {
      return getSelectOptions(field, { value: field.default })
    }
  }

  render() {
    const {
      field,
      isMulti,
      lang
    } = this.props;

    const {
      noOption,
      selectPlaceholder: defaultSelectPlaceholder
    } = flattenLabels(labels, lang);

    return <ReactSelectInput
      value={this.getCurrentValue()}
      options={getSelectOptions(field)}
      onChange={this.onChange.bind(this)}
      isClearable={!isMulti && field.optional}
      noOptionsMessage={() => noOption}
      isMulti={isMulti}
      placeholder={field.placeholder || defaultSelectPlaceholder}
    />

    return <Select
      value={this.getCurrentValue()}
      options={getSelectOptions(field)}
      onChange={this.onChange.bind(this)}
      isClearable={!isMulti && field.optional}
      noOptionsMessage={() => noOption}
      isMulti={isMulti}
      placeholder={field.placeholder || defaultSelectPlaceholder}
      styles={{
        valueContainer: (provided, state) => ({
          ...provided,
          padding: 2
        }),
        multiValueLabel: (provided, state) => ({
          ...provided,
          color: 'white',
          margin: 4,
          fontSize: '1em'
        }),
        singleValue: (provided, state) => ({
          ...provided,
          marginLeft: 10
        }),
        multiValue: (provided, state) => ({
          ...provided,
          backgroundColor: blue
        }),
        multiValueRemove: (provided, state) => ({
          ...provided,
          [':hover']: {
            color: 'white',
            backgroundColor: blue,
            cursor: 'pointer'
          },
          color: 'white',
          backgroundColor: blue
        }),
        option: (provided, state) => {
          let backgroundColor = 'white';

          if (state.isSelected) {
            backgroundColor = blue;
          } else if (state.isFocused) {
            backgroundColor = lightGray;
          }

          return {
            ...provided,
            color: state.isSelected ? 'white' : black,
            backgroundColor
          }
        }
      }}
    />
  }
}