import { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import debug from 'debug';
import { http, HttpResponse, delay } from 'msw';
import EmbedCodePresentation from '../src/components/EmbedCodePresentation';
import ConfigurationMenuSelector from '../src/components/ConfigurationMenuSelector';
import GeneralMenu from '../src/components/GeneralMenu';
import AdvancedMenu from '../src/components/AdvancedMenu';
import TilesMapMenu from '../src/components/TilesMapMenu';
import PositioningMapMenu from '../src/components/PositioningMapMenu';
import MapPresentation from '../src/components/MapPresentation';
import AdvancedWidgetMenu from '../src/components/AdvancedWidgetMenu';
import TagSelectionMenu from '../src/components/TagSelectionMenu';
import ListMenu from '../src/components/ListMenu';
import MapMenu from '../src/components/MapMenu';
import SearchMenu from '../src/components/SearchMenu';
import TagMenu from '../src/components/TagMenu';
import CalendarMenu from '../src/components/CalendarMenu';
import UpdateButton from '../src/components/UpdateButton';
import Presentation from '../src/components/Presentation';

import AdminCanvas from './decorators/AdminCanvas';
import ComponentCanvas from './decorators/ComponentCanvas';
import Providers from './decorators/Providers';

import toulouseEmbed from './fixtures/toulouse.json';
import toulouseEvents from './fixtures/toulouse.events.json';
import apiAgendasToulouse from './fixtures/api.agendas.toulouse.get.json';

const mswHandlers = {
  getEmbed: http.get('/agendas/50522407/embeds/80717033', async () => {
    await delay(2000);
    return HttpResponse.json(apiAgendasToulouse);
  }),
  postEmbed: http.post('/agendas/50522407/embeds', async () => {
    await delay(2000);
    return HttpResponse.json(apiAgendasToulouse);
  }),
  postUpdatedEmbed: http.post('/agendas/50522407/embeds/80717033', async () => {
    await delay(2000);
    return new HttpResponse(null, { status: 200 });
  }),
  getEvents: http.get('/agendas/50522407/events', async () => {
    await delay(2000);
    return HttpResponse.json(toulouseEvents);
  }),
};

export default {
  title: 'Components',
  decorators: [ComponentCanvas, AdminCanvas, Providers],
};

const log = debug('stories');
const onChange = updatedEmbed => log(updatedEmbed);

const embedCodeTemplate = '<div class="cbpgtg cibulTags" data-oatg data-cbctl="<%= agendaUid %>/<%= uid %>"></div><script type="text/javascript" src="//openagenda.com/js/embed/cibulTagsWidget.js"></script>';

export const embedCodePresentation = () => (
  <EmbedCodePresentation
    embed={toulouseEmbed}
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
      value: 'general',
    }, {
      label: 'Widgets: Carte',
      value: 'map',
    }, {
      label: 'Widgets: Champs à choix',
      value: 'tags',
    }, {
      label: 'Widgets: Calendrier',
      value: 'calendar',
    }, {
      label: 'Widgets: Recherche',
      value: 'search',
    }, {
      label: 'Widgets: Aperçu',
      value: 'preview',
    }, {
      label: 'Avancé',
      value: 'advanced',
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
    onChange={onChange}
    embed={toulouseEmbed}
    defaultTiles="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
);

export const advancedWidgetMenu = () => (
  <AdvancedWidgetMenu
    embed={toulouseEmbed}
    onChange={onChange}
    path="config.layout.use_default_css.map"
  />
);

export const tagSelectionMenu = {
  render: () => (
    <TagSelectionMenu
      embed={toulouseEmbed}
      onChange={() => { }}
      res="/agendas/50522407/embeds/80717033"
    />
  ),
  parameters: {
    msw: {
      handlers: [
        mswHandlers.getEmbed,
        mswHandlers.getEvents,
        mswHandlers.postEmbed,
        mswHandlers.postUpdatedEmbed,
      ],
    },
  },
};

export const listMenu = {
  render: () => (
    <ListMenu
      lang="fr"
      embed={toulouseEmbed}
      onChange={onChange}
      displayEmbed
      res={{
        events: '/agendas/50522407/events',
        preview: 'https://d.openagenda.com/agendas/50522407/previewEmbeds/80717033/events',
        previewScript: 'https://d.openagenda.com/js/embed/cibulBodyWidget.js',
      }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        mswHandlers.getEmbed,
        mswHandlers.getEvents,
        mswHandlers.postEmbed,
        mswHandlers.postUpdatedEmbed,
      ],
    },
  },
};

export const mapMenu = () => (
  <MapMenu
    defaultTiles="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    embed={toulouseEmbed}
    embedLanguages={['fr', 'en', 'es', 'it', 'de']}
    onChange={onChange}
  />
);

export const tagMenu = {
  render: () => (
    <TagMenu
      embed={toulouseEmbed}
      onChange={onChange}
      res="/agendas/50522407/embeds/80717033"
    />
  ),
  parameters: {
    msw: {
      handlers: [
        mswHandlers.getEmbed,
        mswHandlers.getEvents,
        mswHandlers.postEmbed,
        mswHandlers.postUpdatedEmbed,
      ],
    },
  },
};

export const searchMenu = () => (
  <SearchMenu
    embed={toulouseEmbed}
    onChange={onChange}
  />
);

export const calendarMenu = () => (
  <CalendarMenu
    embed={toulouseEmbed}
    onChange={onChange}
  />
);

export const EmbedUpdateButton = {
  render: function Render() {
    const [embed, setEmbed] = useState(toulouseEmbed);

    return (
      <>
        <button
          type="button"
          className="btn btn-default margin-all-sm"
          onClick={() => setEmbed({
            ...toulouseEmbed,
            change: Math.random(),
          })}
        >
          Mock a change
        </button>
        <UpdateButton
          embed={embed}
          res="/agendas/50522407/embeds/80717033"
          onSave={() => { }}
        />
      </>
    );
  },
  parameters: {
    msw: {
      handlers: [
        mswHandlers.getEmbed,
        mswHandlers.getEvents,
        mswHandlers.postEmbed,
        mswHandlers.postUpdatedEmbed,
      ],
    },
  },
};

export const EmbedPresentation = {
  render: () => (
    <Presentation
      agendaSlug="toulouse-metropole"
      res="/agendas/50522407/embeds"
      onCreate={() => { }}
    />
  ),
  parameters: {
    msw: {
      handlers: [
        mswHandlers.getEmbed,
        mswHandlers.getEvents,
        mswHandlers.postEmbed,
        mswHandlers.postUpdatedEmbed,
      ],
    },
  },
};
