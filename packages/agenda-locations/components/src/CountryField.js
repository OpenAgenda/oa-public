import React, { Component } from 'react';
import Select from 'react-select';

import countries from '@openagenda/countries/labels';

class CountryField extends Component {
  static defaultProps = {
    enabled: true,
  };

  onChange(code) {
    const { onChange } = this.props;
    onChange('countryCode', code);
  }

  extractCountryNames() {
    const { lang } = this.props;
    return countries.map(c => ({
      value: c.code,
      label: c[lang],
    }));
  }

  render() {
    const { enabled, getLabel } = this.props;
    const options = this.extractCountryNames();
    const value = options.find(option => option.value === this.props.value);

    const selectStyles = {
      menu: provided => ({
        ...provided,
        zIndex: 1042,
      }),
    };

    return (
      <div
        className={
          enabled
            ? 'form-group country'
            : 'form-group country disabled'
        }
      >
        <label htmlFor="Country">{getLabel('country')}</label>
        <Select
          styles={selectStyles}
          disabled={!enabled}
          options={options}
          value={value}
          onChange={value => this.onChange(value ? value.value : value)}
          clearable={false}
        />
      </div>
    );
  }
}

export default CountryField;
