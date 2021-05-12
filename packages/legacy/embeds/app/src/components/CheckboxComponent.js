import _ from 'lodash';
import React from 'react';

import toggleCheckbox from './utils/toggleCheckbox';

export default ({
  embed,
  onChange,
  path,
  label
}) => (
  <div key={path} className="checkbox">
    <label htmlFor={path}>
      <input
        key={path}
        checked={_.get(embed, path)}
        name={path}
        type="checkbox"
        onChange={toggleCheckbox(embed, path, onChange)}
      /> {label}
    </label>
  </div>
);
