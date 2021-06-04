import React from 'react';

import EmbedCodePresentation from './EmbedCodePresentation';
import AdvancedWidgetMenu from './AdvancedWidgetMenu';
import TagSelectionMenu from './TagSelectionMenu';

export default ({
  embed,
  res,
  initialLanguage = 'fr',
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  embedCodeTemplate = '<div class="cbpgtg cibulTags" data-oatg data-cbctl="<%= agendaUid %>/<%= uid %>"></div><script type="text/javascript" src="//openagenda.com/js/embed/cibulTagsWidget.js"></script>',
  onChange
}) => (
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
      <div className="col-sm-12">
        <AdvancedWidgetMenu
          embed={embed}
          onChange={onChange}
          path="config.layout.use_default_css.tags"
        />
        <TagSelectionMenu
          embed={embed}
          onChange={onChange}
          res={res}
        />
      </div>
    </div>
  </div>
);
