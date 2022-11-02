import React, { useMemo } from 'react';
import { renderRoutes } from 'react-router-config';
import { IntlProvider } from 'react-intl';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/activities/user';
import { useLayoutData } from '@openagenda/react-shared';
import commonLocales from '@openagenda/common-labels';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import I18nContext from '../../contexts/I18nContext';
import appLocales from '../../../locales-compiled';

const locales = mergeLocales(appLocales, commonLocales);

function UserApp({ route }) {
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
        <div className="container activity-user top-margined">
          <div className="wsq">
            {renderRoutes(route.routes)}
          </div>
        </div>
      </I18nContext.Provider>
    </IntlProvider>
  );
}

export default UserApp;
