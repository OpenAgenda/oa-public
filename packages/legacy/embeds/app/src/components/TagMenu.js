import React, { useState } from 'react';

import EmbedCodePresentation from './EmbedCodePresentation';
import AdvancedWidgetMenu from './AdvancedWidgetMenu';
import TagSelectionMenu from './TagSelectionMenu';

function renderCode(code, { mode, group, tags }) {
  if (mode === 'all') {
    return code
      .replace('<%= tags %>', '')
      .replace('<%= groups %>', '');

  }
  if (mode === 'picked') {
    return code
      .replace('<%= tags %>', `|${tags.join(',')}`)
      .replace('<%= groups %>', '');
  }
  return code
    .replace('<%= tags %>', '')
    .replace('<%= groups %>', ` data-group="${group || 0}"`);
}

export default ({
  embed,
  res,
  initialLanguage = 'fr',
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  embedCodeTemplate = '<div class="cbpgtg cibulTags" data-oatg data-cbctl="<%= agendaUid %>/<%= uid %><%= tags %>"<%= groups %>></div><script type="text/javascript" src="//openagenda.com/js/embed/cibulTagsWidget.js"></script>',
  onChange
}) => {
  const [widgetConfig, setWidgetConfig] = useState({
    mode: 'all',
    group: null,
    tags: null
  });

  return (
    <div>
      <div className="row margin-bottom-xs">
        <div className="col-sm-12">
          <EmbedCodePresentation
            embed={embed}
            initialLanguage={initialLanguage}
            embedLanguages={embedLanguages}
            embedCodeTemplate={renderCode(embedCodeTemplate, widgetConfig)}
            widgetConfig={widgetConfig}
          />
        </div>
      </div>
      <div className="row margin-v-sm">
        <div className="col-sm-12">
          <AdvancedWidgetMenu
            embed={embed}
            onChange={onChange}
            path="config.layout.use_default_css.tags"
          />
          <TagSelectionMenu
            embed={embed}
            onChange={setWidgetConfig}
            res={res}
          />
        </div>
      </div>
    </div>
  );
};
