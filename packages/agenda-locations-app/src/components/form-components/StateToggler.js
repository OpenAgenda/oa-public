import React from 'react';
import Switch from 'rc-switch';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  toverify: {
    id: 'AgendaLocations.StateToggler.toverify',
    defaultMessage: 'This location has to be verified',
  },
  verified: {
    id: 'AgendaLocations.StateToggler.verified',
    defaultMessage: 'This location is verified',
  },
});

const StateToggler = ({ locationState, onChange }) => (
  <div className="state">
    <Switch
      checked={locationState === 1}
      onChange={b => onChange(b ? 1 : 0)}
      checkedChildren={<i className="fa fa-check" />}
      unCheckedChildren={<i className="fa fa-bell-o" />}
    />
    <span>
      {locationState === 1
        ? <FormattedMessage {...messages.verified} />
        : <FormattedMessage {...messages.toverify} />}
    </span>
  </div>
);

export default StateToggler;
