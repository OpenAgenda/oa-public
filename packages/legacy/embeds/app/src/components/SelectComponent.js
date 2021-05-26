import _ from 'lodash';
import React from 'react';

import {
  produce
} from 'immer';

import { ReactSelectInput } from '@openagenda/react-shared';

export default ({
  embed,
  onChange,
  label,
  path,
  options
}) => (
  <div className="form-group">
    <label htmlFor={path}>{label}</label>
    <ReactSelectInput
      name={path}
      value={options.filter(o => o.value === _.get(embed, path)).shift()}
      isClearable={false}
      options={options}
      onChange={o => onChange(produce(embed, draft => {
        _.set(draft, path, o.value);
      }))}
    />
  </div>
);
