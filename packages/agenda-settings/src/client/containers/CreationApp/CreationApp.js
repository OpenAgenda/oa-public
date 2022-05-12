import React, { useMemo } from 'react';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { css } from '@emotion/react';
import makeGetterLabel from '@openagenda/labels';
import { useLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import labels from '@openagenda/labels/agenda-settings/agendaCreation';
import locales from '../../../locales-compiled';
import * as agendaActions from '../../reducers/agenda';
import I18nContext from '../../contexts/I18nContext';

function CreationApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(() => ({
    lang,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, lang)
  }), [lang]);

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <I18nContext.Provider value={i18nContextValue}>
        <div
          className="page"
          css={css`
            .radio label, .checkbox label {
              line-height: 20px;
            }
          `}
        >
          <div className="container agenda-settings-creation">
            {renderRoutes(route.routes)}
          </div>
        </div>
      </I18nContext.Provider>
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    agenda: agendaActions.default,
  }),
})(CreationApp);
