import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import debug from 'debug';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import EmbedCodePresentation from '../src/components/EmbedCodePresentation';
import ConfigurationMenuSelector from '../src/components/ConfigurationMenuSelector';
import GeneralMenu from '../src/components/GeneralMenu';
import SharesMenu from '../src/components/SharesMenu';
import AdvancedMenu from '../src/components/AdvancedMenu';
import TilesMapMenu from '../src/components/TilesMapMenu';
import PositioningMapMenu from '../src/components/PositioningMapMenu';
import MapPresentation from '../src/components/MapPresentation';
import AdvancedWidgetMenu from '../src/components/AdvancedWidgetMenu';
import TagSelectionMenu from '../src/components/TagSelectionMenu';

import AdminCanvas from './decorators/AdminCanvas';
import Providers from './decorators/Providers';

import toulouseEmbed from './fixtures/toulouse.json';
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json';

const mock = new MockAdapter(axios);

const mockApi = () => {
  mock.onGet('/agendas/50522407').reply(
    200,
    apiAgendasToulouse
  );
};

export default {
  title: 'Configuration components',
  decorators: [AdminCanvas, Providers]
};

const log = debug('stories');
const onChange = updatedEmbed => log(updatedEmbed);

const embedCodeTemplate = '<iframe style="width:100%;" frameborder="0" scrolling="no" allowtransparency="allowtransparency" class="cibulFrame cbpgbdy" data-oabdy src="//openagenda.com/agendas/89904399/embeds/87998200/events?lang=<%= lang %>" data-lang="<%= lang %>"></iframe><script type="text/javascript" src="//openagenda.com/js/embed/cibulBodyWidget.js"></script>';

export const embedCodePresentation = () => (
  <EmbedCodePresentation
    label="Vue principale de l'agenda intégré. Elle montre la liste des événements de l'agenda ainsi que la vue détaillée de n'importe quel événement par simple clic. Affichez-le sur votre site en y plaçant le code."
    embedCodeTemplate={embedCodeTemplate}
    embedLanguages={['fr', 'en', 'es', 'it', 'de']}
    initialLanguage="fr"
  />
);

export const configutionMenuSelector = () => (
  <ConfigurationMenuSelector
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
    onSelect={menu => log(menu)}
  />
);

export const generalMenu = () => (
  <GeneralMenu
    embed={toulouseEmbed}
    onChange={onChange}
  />
);

export const sharesMenu = () => (
  <SharesMenu
    embed={toulouseEmbed}
    onChange={onChange}
  />
);

export const advancedMenu = () => (
  <AdvancedMenu
    embed={toulouseEmbed}
    onChange={onChange}
  />
);

export const tilesMapMenu = () => (
  <TilesMapMenu
    embed={toulouseEmbed}
    onChange={onChange}
  />
);

export const positioningMapMenu = () => (
  <PositioningMapMenu
    embed={toulouseEmbed}
    onChange={onChange}
  />
);

export const mapPresentation = () => (
  <MapPresentation
    tiles="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
);

export const advancedWidgetMenu = () => (
  <AdvancedWidgetMenu
    embed={toulouseEmbed}
    onChange={onChange}
    path="config.layout.use_default_css.map"
  />
);

export const tagSelectionMenu = () => {
  mockApi();

  return (
    <TagSelectionMenu
      embed={toulouseEmbed}
      onChange={onChange}
      res="/agendas/50522407"
    />
  );
};
