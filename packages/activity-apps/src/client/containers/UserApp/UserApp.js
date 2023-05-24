import React from 'react';
import { renderRoutes } from 'react-router-config';
import { IntlProvider } from 'react-intl';
import { useLayoutData } from '@openagenda/react-shared';
import commonLocales from '@openagenda/common-labels';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import appLocales from '../../../locales-compiled';

const locales = mergeLocales(appLocales, commonLocales);

function UserApp({ route }) {
  const { lang } = useLayoutData();

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div className="container activity-user top-margined">
        <div className="wsq">
          {renderRoutes(route.routes)}
        </div>
      </div>
    </IntlProvider>
  );
}

export default UserApp;
