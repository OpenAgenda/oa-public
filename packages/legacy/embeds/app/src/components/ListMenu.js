import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import ConfigurationMenuSelector from './ConfigurationMenuSelector';
import EmbedCodePresentation from './EmbedCodePresentation';
import GeneralMenu from './GeneralMenu';
import SharesMenu from './SharesMenu';
import AdvancedMenu from './AdvancedMenu';

const messages = defineMessages({
  generalMenu: {
    id: 'LegacyEmbed.App.generalMenu',
    defaultMessage: 'General'
  },
  sharesMenu: {
    id: 'LegacyEmbed.App.sharesMenu',
    defaultMessage: 'Shares'
  },
  advancedMenu: {
    id: 'LegacyEmbed.App.advancedMenu',
    defaultMessage: 'Advanced'
  }
});

export default ({
  embed,
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  embedCodeTemplate = '<iframe style="width:100%;" frameborder="0" scrolling="no" allowtransparency="allowtransparency" class="cibulFrame cbpgbdy" data-oabdy src="//openagenda.com/agendas/<%= agendaUid %>/embeds/<%= uid %>/events?lang=<%= lang %>" data-lang="<%= lang %>"></iframe><script type="text/javascript" src="//openagenda.com/js/embed/cibulBodyWidget.js"></script>',
  initialLanguage,
  preview,
  previewScript,
  onChange,
  displayEmbed = true
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
            embedLanguages={embedLanguages}
            embedCodeTemplate={embedCodeTemplate}
          />
        </div>
      </div>
      <div className="row margin-v-sm">
        <div className="col-sm-6">
          <ConfigurationMenuSelector
            options={[{
              label: m(messages.generalMenu),
              value: 'general'
            }, {
              label: m(messages.sharesMenu),
              value: 'shares'
            }, {
              label: m(messages.advancedMenu),
              value: 'advanced'
            }]}
            onSelect={setSelectedMenu}
          />
        </div>
      </div>
      <div className="row margin-v-xs">
        <div className="col-sm-12">
          <div className="margin-left-xs">
            {selectedMenu === 'general' ? (
              <GeneralMenu
                embed={editedEmbed}
                onChange={setEditedEmbed}
              />
            ) : null}
            {selectedMenu === 'advanced' ? (
              <AdvancedMenu
                embed={editedEmbed}
                onChange={setEditedEmbed}
              />
            ) : null}
            {selectedMenu === 'shares' ? (
              <SharesMenu
                embed={editedEmbed}
                onChange={setEditedEmbed}
              />
            ) : null}
          </div>
        </div>
      </div>
      {displayEmbed ? (
        <div className="row margin-v-xs">
          <div className="col-sm-12">
            <iframe
              data-lang="fr"
              scrolling="no"
              className="cbpgbdy js_preview"
              style={{
                width: '100%',
                minHeight: '1000px'
              }}
              title="preview"
              src={preview}
            />
            <script type="text/javascript" src={previewScript} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
