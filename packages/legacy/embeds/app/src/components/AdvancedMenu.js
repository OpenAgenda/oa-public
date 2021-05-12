import React from 'react';

import CheckboxComponent from './CheckboxComponent';
import InputComponent from './InputComponent';

export default ({
  embed,
  onChange
}) => (
  <div>
    <CheckboxComponent
      embed={embed}
      onChange={onChange}
      path="config.layout.autoscroll"
      label="Charger les événements automatiquement quand la fin de la liste est atteinte"
    />
    <InputComponent
      embed={embed}
      onChange={onChange}
      type="url"
      path="config.layout.linkcss"
      label="Ajoutez un lien vers une feuille de style"
    />
    <InputComponent
      embed={embed}
      onChange={onChange}
      type="textarea"
      path="config.layout.customcss"
      label="Saisissez votre css"
      rows={10}
    />
    <InputComponent
      embed={embed}
      onChange={onChange}
      type="textarea"
      path="config.head"
      label="Segment <head> personnalisé"
      rows={10}
    />
    <InputComponent
      embed={embed}
      onChange={onChange}
      type="textarea"
      path="template.header"
      label="En tête de vue liste"
      rows={10}
    />
    <InputComponent
      embed={embed}
      onChange={onChange}
      type="textarea"
      rows={10}
      path="template.eventitem"
      label="Définissez un gabarit pour les élements de liste"
    />
    <InputComponent
      embed={embed}
      onChange={onChange}
      type="textarea"
      rows={10}
      path="template.eventitem"
      label="Définissez un gabarit pour les pages événements"
    />
  </div>
);
