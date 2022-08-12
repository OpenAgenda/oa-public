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
  AgendaContextBar
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
  states,
  drafts
}) {
  log('loading context bar');
  const intl = useIntl();

  return (
    <AgendaContextBar
      res={{
        drafts: `/api/me/agendas/${agenda.uid}/events/drafts`,
        events: `/api/me/agendas/${agenda.uid}/events`
      }}
      drafts={drafts}
      states={states}
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
    states,
    drafts
  } = props;

  if (!states.length && drafts === 0) {
    return;
  }
  
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