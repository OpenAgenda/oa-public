import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { ReactSelectInput } from '@openagenda/react-shared';

import ConfigurationMenuSelector from './ConfigurationMenuSelector';
import EmbedCodePresentation from './EmbedCodePresentation';
import GeneralMenu from './GeneralMenu';
import SharesMenu from './SharesMenu';
import AdvancedMenu from './AdvancedMenu';

const flatten = (obj = {}, lang) => obj[obj[lang] ? lang : Object.keys(obj).shift()];

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
  },
  listPreview: {
    id: 'LegacyEmbed.App.listPreview',
    defaultMessage: 'List view'
  },
  eventPreview: {
    id: 'LegacyEmbed.App.eventPreview',
    defaultMessage: 'Detailed'
  }
});

export default ({
  embed,
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  embedCodeTemplate = '<iframe style="width:100%;" frameborder="0" scrolling="no" allowtransparency="allowtransparency" class="cibulFrame cbpgbdy" data-oabdy src="//openagenda.com/agendas/<%= agendaUid %>/embeds/<%= uid %>/events?lang=<%= lang %>" data-lang="<%= lang %>"></iframe><script type="text/javascript" src="//openagenda.com/js/embed/cibulBodyWidget.js"></script>',
  initialLanguage,
  res,
  lang,
  onChange,
  displayEmbed = true
}) => {
  const m = useIntl().formatMessage;

  const {
    preview,
    events: eventsRes
  } = res;

  const [selectedMenu, setSelectedMenu] = useState(null);
  const [editedEmbed, setEditedEmbed] = useState(embed);

  const [previews, setPreviews] = useState([{
    value: preview,
    label: m(messages.listPreview)
  }]);
  const [previewIndex, setPreviewIndex] = useState(0);

  useQuery('previewEvents', () => axios.get(eventsRes), {
    select: ({ data }) => {
      setPreviews(previews.concat(data.events.map(e => ({
        value: `${res.preview}/${e.uid}`,
        label: `${m(messages.eventPreview)} (${flatten(e.title, lang)})`
      }))));
    }
  });

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
      <ReactSelectInput
        name="previewSelector"
        isClearable={false}
        options={previews.map((p, i) => ({
          value: i,
          label: p.label
        }))}
        value={previews[previewIndex]}
        onChange={({ value }) => setPreviewIndex(value)}
      />
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
              src={previews[previewIndex].value}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
