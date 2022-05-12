import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import { IntlProvider } from 'react-intl';
import { css } from '@emotion/react';
import { Spinner, useLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-settings/agendaEdition';
import locales from '../../../locales-compiled';
import * as agendaActions from '../../reducers/agenda';
import * as keysActions from '../../reducers/keys';
import * as modalsActions from '../../reducers/modals';
import I18nContext from '../../contexts/I18nContext';


function EditionApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(() => ({
    lang,
    getLabel: (label, values = {}) => makeGetterLabel(labels)(label, values, lang)
  }), [lang]);

  const loading = useSelector(state => state.agenda.loading);

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <I18nContext.Provider value={i18nContextValue}>
        <div
          className="agenda-settings-edit"
          css={css`
            .radio label, .checkbox label {
              line-height: 20px;
            }
          `}
        >
          {loading
            ? (
              <div style={{ margin: '150px 0' }}>
                <Spinner />
              </div>
            ) : renderRoutes(route.routes)}
        </div>
      </I18nContext.Provider>
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    agenda: agendaActions.default,
    keys: keysActions.default,
    modals: modalsActions.default,
  }),
  defer: async ({ store: { dispatch, getState } }) => {
    const promises = [];

    // if ( !agendaActions.isLoaded( getState() ) ) {
    //   promises.push( dispatch( agendaActions.load() ) );
    // }

    if (!keysActions.isLoaded(getState())) {
      promises.push(dispatch(keysActions.load()));
    }

    return Promise.all(typeof window !== 'undefined' ? [] : promises);
  }
})(EditionApp);
