import React from 'react';

import CheckboxComponent from './CheckboxComponent';
import SelectComponent from './SelectComponent';

const layoutModeOptions = [{
  value: 'standard',
  label: 'Standard'
}, {
  value: 'tiled',
  label: 'Damier'
}, {
  value: 'cascading',
  label: 'En cascade'
}, {
  value: 'nocss',
  label: 'Aucun css (avancé)'
}];

export default ({
  embed,
  onChange
}) => (
  <div>
    <CheckboxComponent
      embed={embed}
      onChange={onChange}
      path="config.layout.synchref"
      label="Mettre à jour la barre d'adresse du navigateur avec les paramètres de l'agenda"
    />
    <CheckboxComponent
      embed={embed}
      onChange={onChange}
      path="config.layout.use_event_slug"
      label="Utiliser les titres des événements dans les liens"
    />
    <SelectComponent
      embed={embed}
      onChange={onChange}
      path="config.layout.layoutmode"
      options={layoutModeOptions}
      label="Présentation de la liste"
    />
  </div>
);
