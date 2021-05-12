import React from 'react';

import InputComponent from './InputComponent';

export default ({
  embed,
  onChange
}) => (
  <div>
    <InputComponent
      embed={embed}
      onChange={onChange}
      path="config.layout.mapTiles"
      label="Modifiez les tuiles utilisées pour la carte"
      placeholder="Collez le lien des tuiles ici"
    />
  </div>
);
