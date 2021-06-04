import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AdvancedWidgetMenu from './AdvancedWidgetMenu';
import EmbedCodePresentation from './EmbedCodePresentation';

const messages = defineMessages({
  calendarCodeLabel: {
    id: 'LegacyEmbed.CalendarMenu.code',
    defaultMessage: 'This widget allows you to filter the embedded agenda by range of dates.'
    // Ce widget permet de filtrer la liste intégrée par des sélections de périodes.
  }
});

export default ({
  embed,
  onChange,
  initialLanguage = 'fr',
  embedLanguages = ['fr', 'en', 'es', 'it', 'de'],
  embedCodeTemplate = '<div class="cbpgcl cibulCalendar" data-oacl data-cbctl="<%= agendaUid %>/<%= uid %>|<%= lang %>" data-lang="<%= lang %>"></div><script type="text/javascript" src="//openagenda.com/js/embed/cibulCalendarWidget.js"></script>'
}) => {
  const m = useIntl().formatMessage;

  return (
    <div>
      <div className="row margin-bottom-xs">
        <div className="col-sm-12">
          <EmbedCodePresentation
            embed={embed}
            initialLanguage={initialLanguage}
            label={m(messages.calendarCodeLabel)}
            embedLanguages={embedLanguages}
            embedCodeTemplate={embedCodeTemplate}
          />
          <AdvancedWidgetMenu
            embed={embed}
            onChange={onChange}
            path="config.layout.use_default_css.map"
          />
        </div>
      </div>
    </div>
  );
};
