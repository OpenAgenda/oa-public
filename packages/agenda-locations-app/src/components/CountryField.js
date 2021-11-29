import React from 'react';
import Select from 'react-select';
import { defineMessages, FormattedMessage } from 'react-intl';

import countries from '@openagenda/countries/labels';

const messages = defineMessages({
  country: {
    id: 'AgendaLocations.CountryField.country',
    defaultMessage: 'Country',
  },
});

const CountryField = ({
  lang,
  enabled = true,
  onChange,
  pValue
}) => {
  const myOnChange = code => {
    onChange('countryCode', code);
  };

  const extractCountryNames = () => countries.map(c => ({
    value: c.code,
    label: c[lang],
  }));

  const selectStyles = {
    menu: provided => ({
      ...provided,
      zIndex: 1042,
    }),
  };

  const options = extractCountryNames();
  const value = options.find(option => option.value === pValue);

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
        onChange={val => myOnChange(val ? val.value : val)}
        clearable={false}
      />
    </div>
  );
};

export default CountryField;
