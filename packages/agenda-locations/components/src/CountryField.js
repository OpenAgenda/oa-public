import React, { Component } from 'react';
import Select from 'react-select';
import { defineMessages, FormattedMessage } from 'react-intl';
import debug from 'debug';

import countries from '@openagenda/countries/labels';

const log = debug('CountryField');

const messages = defineMessages({
  country: {
    id: 'AgendaLocations.CountryField.country',
    defaultMessage: 'Country',
  },
});

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
    const { enabled, value: pValue } = this.props;
    const options = this.extractCountryNames();
    const value = options.find(option => option.value === pValue);
    log(options);

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
        <label htmlFor="Country"><FormattedMessage {...messages.country} /></label>
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
