import _ from 'lodash';
import React from 'react';

import {
  produce
} from 'immer';

import { useIntl, defineMessages } from 'react-intl';

import CheckboxComponent from './CheckboxComponent';
import { ReactSelectInput } from '@openagenda/react-shared';

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

  const positionModeOptions = [{
    label: m(messages.mapPositionModeManual),
    value: 'manual'
  }, {
    label: m(messages.mapPositionModeAuto),
    value: 'automatic'
  }];

  return (
    <div>
      <CheckboxComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.mapAuto"
        label={m(messages.mapAuto)}
      />
      <div className="form-group">
        <label htmlFor="config.layout.mapPositionMode">{m(messages.mapPositionMode)}</label>
        <ReactSelectInput
          name="config.layout.mapPositionMode"
          value={positionModeOptions.filter(o => o.value === _.get(embed, 'config.layout.mapPositionMode')).shift()}
          isClearable={false}
          options={positionModeOptions}
          onChange={o => onChange(produce(embed, draft => {
            _.set(draft, 'config.layout.mapPositionMode', o.value);

            if (o.value === 'automatic') {
              _.set(draft, 'config.layout.mapCorners', {
                neLat: false, neLng: false, swLat: false, swLng: false
              });
            }
          }))}
        />
      </div>
    </div>
  );
};
