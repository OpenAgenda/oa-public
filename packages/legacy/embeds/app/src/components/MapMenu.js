import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import EmbedCodePresentation from './EmbedCodePresentation';
import ConfigurationMenuSelector from './ConfigurationMenuSelector';
import MapPresentation from './LoadableMapPresentation';
import TilesMapMenu from './TilesMapMenu';
import PositioningMapMenu from './PositioningMapMenu';
import AdvancedWidgetMenu from './AdvancedWidgetMenu';

const messages = defineMessages({
  mapCodeLabel: {
    id: 'LegacyEmbed.App.mapCodeLabel',
    defaultMessage: 'This widget shows the events on a map and filters down event list when markers are clicked.'
  },
  tilesMenu: {
    id: 'LegacyEmbed.App.tilesMenu',
    defaultMessage: 'Tiles'
  },
  positioningMenu: {
    id: 'LegacyEmbed.App.positioningMenu',
    defaultMessage: 'Positioning'
  },
  advancedMenu: {
    id: 'LegacyEmbed.App.advancedMenu',
    defaultMessage: 'Advanced'
  }
});

export default ({
  embed,
  defaultTiles,
  initialLanguage = 'fr',
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  embedCodeTemplate = '<div class="cbpgmp cibulMap" data-oamp data-cbctl="<%= agendaUid %>/<%= uid %>" data-lang="<%= lang %>" ></div><script type="text/javascript" src="//openagenda.com/js/embed/cibulMapWidget.js"></script>',
  onChange
}) => {
  const m = useIntl().formatMessage;

  const [selectedMenu, setSelectedMenu] = useState(null);
  const [editedEmbed, setEditedEmbed] = useState(embed);

  useEffect(() => {
    onChange(editedEmbed);
  }, [editedEmbed, onChange]);

  return (
    <div>
      <div className="row margin-bottom-xs">
        <div className="col-sm-12">
          <EmbedCodePresentation
            embed={embed}
            initialLanguage={initialLanguage}
            label={m(messages.mapCodeLabel)}
            embedLanguages={embedLanguages}
            embedCodeTemplate={embedCodeTemplate}
          />
        </div>
      </div>
      <div className="row margin-v-sm">
        <div className="col-sm-6">
          <ConfigurationMenuSelector
            options={[{
              label: m(messages.tilesMenu),
              value: 'tiles'
            }, {
              label: m(messages.positioningMenu),
              value: 'position'
            }, {
              label: m(messages.advancedMenu),
              value: 'advanced'
            }]}
            onSelect={setSelectedMenu}
          />
          <div className="margin-v-sm">
            {selectedMenu === 'tiles' ? (
              <TilesMapMenu
                embed={editedEmbed}
                onChange={setEditedEmbed}
              />
            ) : null}
            {selectedMenu === 'position' ? (
              <PositioningMapMenu
                embed={editedEmbed}
                onChange={setEditedEmbed}
              />
            ) : null}
            {selectedMenu === 'advanced' ? (
              <AdvancedWidgetMenu
                embed={editedEmbed}
                onChange={setEditedEmbed}
                path="config.layout.use_default_css.map"
              />
            ) : null}
          </div>
        </div>
        <div className="col-sm-6">
          <MapPresentation
            defaultTiles={defaultTiles}
            embed={editedEmbed}
            embedLanguages={['fr', 'en', 'es', 'it', 'de']}
            onChange={setEditedEmbed}
          />
        </div>
      </div>
    </div>
  );
};
