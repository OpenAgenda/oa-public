import React, { useMemo } from 'react';
import { provideHooks } from 'redial';
import { renderRoutes } from 'react-router-config';
import { reducer as formReducer } from 'redux-form';
import { IntlProvider } from 'react-intl';
import { useLayoutData } from '@openagenda/react-shared';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/agenda';
import commonLocales from '@openagenda/common-labels';
import modalsReducer from '../../redux/modules/modals';
import activitiesReducer from '../../redux/modules/activities';
import I18nContext from '../../contexts/I18nContext';
import appLocales from '../../../locales-compiled';

const locales = mergeLocales(appLocales, commonLocales);

function AgendaApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(() => ({
    lang,
    labels,
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
        <div className="activity-agenda-admin">
          {renderRoutes(route.routes)}
        </div>
      </I18nContext.Provider>
    </IntlProvider>
  );
}

export default provideHooks({
  inject: ({ store }) => store.inject({
    form: formReducer,
    modals: modalsReducer,
    activities: activitiesReducer
  })
})(AgendaApp);
