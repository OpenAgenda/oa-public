import React from 'react';

import CheckboxComponent from './CheckboxComponent';
import SelectComponent from './SelectComponent';

export default ({
  embed,
  onChange
}) => (
  <div>
    <CheckboxComponent
      embed={embed}
      onChange={onChange}
      path="config.layout.mapAuto"
      label="Mettre à jour la sélection automatiquement lors de la navigation avec la carte"
    />
    <SelectComponent
      embed={embed}
      onChange={onChange}
      path="config.layout.mapPositionMode"
      label="Définir le positionnement initial de la carte"
      options={[{
        label: 'Manuel',
        value: 'manual'
      }, {
        label: 'Automatique',
        value: 'automatic'
      }]}
    />
  </div>
);
