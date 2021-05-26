import React from 'react';

import { defineMessages, useIntl } from 'react-intl';
import InputComponent from './InputComponent';

const messages = defineMessages({
  tilesInputLabel: {
    id: 'LegacyEmbed.TilesMapMenu.tilesInputLabel',
    defaultMessage: 'Specify a custom tiles link to be used by the map',
  },
  tilesInputPlaceholder: {
    id: 'LegacyEmbed.TilesMapMenu.tilesInputPlaceholder',
    defaultMessage: 'Paste the tile link template here',
  }
});

export default ({
  embed,
  onChange
}) => {
  const intl = useIntl();

  return (
    <div>
      <InputComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.mapTiles"
        label={intl.formatMessage(messages.tilesInputLabel)}
        placeholder={intl.formatMessage(messages.tilesInputPlaceholder)}
      />
    </div>
  );
};
