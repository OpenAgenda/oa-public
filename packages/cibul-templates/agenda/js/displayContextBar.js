'use strict';

import React from 'react';
import ReactDom from 'react-dom';
import debug from 'debug';

import {
  mergeLocales,
  getSupportedLocale,
} from '@openagenda/intl';

import {
  locales as contextLocales,
  AgendaContextBar,
  AgendaAdminModContextBar
} from '@openagenda/react-shared';

import {
  IntlProvider,
  defineMessages,
  useIntl
} from 'react-intl';

import appLocales from '../../locales-compiled';

const messages = defineMessages({
  completeAction: {
    id: 'cibulTemplates.displayContextBar.completeAction',
    defaultMessage: 'Complete'
  },
  modifyAction: {
    id: 'cibulTemplates.displayContextBar.modifyAction',
    defaultMessage: 'Modify'
  },
  displayAction: {
    id: 'cibulTemplates.displayContextBar.displayAction',
    defaultMessage: 'Display'
  }
});

const log = debug('displayContextBar');

function AgendaContextBarContainer({
  agenda,
  myEvents,
  events,
  canContribute,
  role
}) {
  log('loading context bar');
  const intl = useIntl();

  if (['administrator', 'moderator'].includes(role)) {
    return (
      <AgendaAdminModContextBar
        res={`/${agenda.slug}/admin/events`}
        states={events.states}
      />
    );
  }

  return (
    <AgendaContextBar
      res={{
        drafts: `/api/me/agendas/${agenda.uid}/events/drafts`,
        events: `/api/me/agendas/${agenda.uid}/events`,
        contribute: canContribute ? `/${agenda.slug}/contribute` : null
      }}
      drafts={myEvents.drafts}
      states={myEvents.states}
      actions={{
        drafts: [{
          link: `/${agenda.slug}/contribute/event/{event.uid}`,
          label: intl.formatMessage(messages.completeAction)
        }],
        events: [{
          link: `/agendas/${agenda.uid}/events/{event.uid}`,
          label: intl.formatMessage(messages.displayAction)
        }, {
          link: `/${agenda.slug}/contribute/event/{event.uid}`,
          label: intl.formatMessage(messages.modifyAction)
        }]
      }}
    />
  );
}

export default function displayContextBar(props) {
  const contextContainer = document.querySelector('.js_context');

  if (!contextContainer) {
    return;
  }

  const {
    lang,
  } = props;
  
  const locales = mergeLocales(appLocales, contextLocales);

  ReactDom.render(
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <AgendaContextBarContainer {...props} />
    </IntlProvider>,
    contextContainer
  );
}