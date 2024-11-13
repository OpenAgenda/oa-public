import { useMemo } from 'react';
import { renderRoutes } from 'react-router-config';
import redial from 'redial';
import { IntlProvider } from 'react-intl';
import makeGetterLabel from '@openagenda/labels';
import { useLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import labels from '@openagenda/labels/agenda-settings/agendaCreation.js';
import * as locales from '../../../locales-compiled/index.js';
import * as agendaActions from '../../reducers/agenda.js';
import I18nContext from '../../contexts/I18nContext.js';

function CreationApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(
    () => ({
      lang,
      getLabel: (label, values = {}) =>
        makeGetterLabel(labels)(label, values, lang),
    }),
    [lang],
  );

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      // eslint-disable-next-line import/namespace
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <I18nContext.Provider value={i18nContextValue}>
        <div className="page">
          <div className="container agenda-settings-creation">
            {renderRoutes(route.routes)}
          </div>
        </div>
      </I18nContext.Provider>
    </IntlProvider>
  );
}

export default redial.provideHooks({
  inject: ({ store }) =>
    store.inject({
      agenda: agendaActions.default,
    }),
})(CreationApp);
