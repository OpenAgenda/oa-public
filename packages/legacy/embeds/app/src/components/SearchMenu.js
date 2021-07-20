import React from 'react';
import AdvancedWidgetMenu from './AdvancedWidgetMenu';
import EmbedCodePresentation from './EmbedCodePresentation';

export default ({
  embed,
  onChange,
  initialLanguage = 'fr',
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  embedCodeTemplate = '<div class="cbpgsc cibulSearch" data-oasc data-cbctl="<%= agendaUid %>/<%= uid %>|<%= lang %>" data-lang="fr"></div><script type="text/javascript" src="//openagenda.com/js/embed/cibulSearchWidget.js"></script>'
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
        <AdvancedWidgetMenu
          embed={embed}
          onChange={onChange}
          path="config.layout.use_default_css.search"
        />
      </div>
    </div>
  </div>
);
