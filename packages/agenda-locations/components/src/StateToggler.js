import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'rc-switch';

const StateToggler = ({ locationState, getLabel, onChange }) => (
  <div className="state">
    <Switch
      checked={locationState === 1}
      onChange={b => onChange(b ? 1 : 0)}
      checkedChildren={<i className="fa fa-check" />}
      unCheckedChildren={<i className="fa fa-bell-o" />}
    />
    <span>
      {getLabel(
        locationState === 1 ? 'verified' : 'toverify'
      )}
    </span>
  </div>
);

StateToggler.propTypes = {
  // current location state
  locationState: PropTypes.number.isRequired,
  // label getter
  getLabel: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

export default StateToggler;
