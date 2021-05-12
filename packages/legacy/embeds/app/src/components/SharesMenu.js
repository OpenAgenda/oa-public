import React from 'react';
import InputComponent from './InputComponent';
import CheckboxComponent from './CheckboxComponent';

const shares = [{
  label: 'Facebook',
  path: 'config.layout.shares.fb'
}, {
  label: 'Twitter',
  path: 'config.layout.shares.tw'
}, {
  label: 'LinkedIn',
  path: 'config.layout.shares.li'
}, {
  label: 'Pinterest',
  path: 'config.layout.shares.pi'
}, {
  label: 'Email',
  path: 'config.layout.shares.em'
}];

export default ({
  embed,
  onChange
}) => (
  <div>
    {shares.map(s => (<CheckboxComponent embed={embed} onChange={onChange} {...s} />))}
    <InputComponent
      embed={embed}
      type="text"
      label="L'identifiant de l'app Facebook de votre site"
      path="config.facebookappid"
      sub="Requis pour partager des événements sur facebook avec des liens pointant vers votre site"
      onChange
    />
    <InputComponent
      embed={embed}
      type="'url"
      label="Utilisez l'url de votre site pour les liens de partages (activez l'option de mise à jour de la barre d'adresse)"
      path="config.siteurl"
      onChange
    />
  </div>
);
