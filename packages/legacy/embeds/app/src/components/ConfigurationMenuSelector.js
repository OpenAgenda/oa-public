import React from 'react';

import { ReactSelectInput } from '@openagenda/react-shared';

import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  menuSelectorPlaceholder: {
    id: 'LegacyEmbed.ConfigurationMenuSelector.placeholder',
    defaultMessage: 'Select a menu'
  }
});

export default ({
  onSelect,
  options
}) => {
  const m = useIntl().formatMessage;

  return (
    <ReactSelectInput
      name="configurationMenuSelector"
      isClearable={false}
      placeholder={m(messages.menuSelectorPlaceholder)}
      onChange={({ value }) => onSelect(value)}
      options={options}
    />
  );
};
