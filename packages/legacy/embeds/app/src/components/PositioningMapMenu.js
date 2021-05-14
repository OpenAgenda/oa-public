import React from 'react';

import { useIntl, defineMessages } from 'react-intl';

import CheckboxComponent from './CheckboxComponent';
import SelectComponent from './SelectComponent';

const messages = defineMessages({
  mapAuto: {
    id: 'LegacyEmbed.PositioningMapMenu.mapAuto',
    defaultMessage: 'Update browser address bar with agenda parameters'
  },
  mapPositionMode: {
    id: 'LegacyEmbed.PositioningMapMenu.mapPositionMode',
    defaultMessage: 'Define inital map position'
  },
  mapPositionModeManual: {
    id: 'LegacyEmbed.PositioningMapMenu.mapPositionModeManual',
    defaultMessage: 'Manual'
  },
  mapPositionModeAuto: {
    id: 'LegacyEmbed.PositioningMapMenu.mapPositionModeAuto',
    defaultMessage: 'Automatic'
  }
});

export default ({
  embed,
  onChange
}) => {
  const m = useIntl().formatMessage;

  return (
    <div>
      <CheckboxComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.mapAuto"
        label={m(messages.mapAuto)}
      />
      <SelectComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.mapPositionMode"
        label={m(messages.mapPositionMode)}
        options={[{
          label: m(messages.mapPositionModeManual),
          value: 'manual'
        }, {
          label: m(messages.mapPositionModeAuto),
          value: 'automatic'
        }]}
      />
    </div>
  );
};
