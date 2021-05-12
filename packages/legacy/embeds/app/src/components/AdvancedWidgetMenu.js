import React from 'react';

import CheckboxComponent from './CheckboxComponent';

export default ({
  embed,
  onChange,
  path
}) => (
  <div>
    <CheckboxComponent
      embed={embed}
      onChange={onChange}
      path={path}
      label="Utiliser le css par défaut"
    />
  </div>
);
