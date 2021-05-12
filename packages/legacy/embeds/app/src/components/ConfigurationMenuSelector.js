import React from 'react';

import { ReactSelectInput } from '@openagenda/react-shared';

export default ({
  onSelect
}) => (
  <ReactSelectInput
    name="configurationMenuSelector"
    isClearable={false}
    placeholder="Sélectionner un menu"
    onChange={({ value }) => onSelect(value)}
    options={[{
      label: 'Général',
      value: 'general'
    }, {
      label: 'Partages',
      value: 'shares'
    }, {
      label: 'Widgets: Carte',
      value: 'map'
    }, {
      label: 'Widgets: Champs à choix',
      value: 'tags'
    }, {
      label: 'Widgets: Calendrier',
      value: 'calendar'
    }, {
      label: 'Widgets: Recherche',
      value: 'search'
    }, {
      label: 'Widgets: Aperçu',
      value: 'preview'
    }, {
      label: 'Avancé',
      value: 'advanced'
    }]}
  />
);
