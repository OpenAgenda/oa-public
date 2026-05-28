import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { renderRoutes } from 'react-router-config';
import redial from 'redial';
import { IntlProvider } from 'react-intl';
import {
  Spinner,
  useLayoutData,
  locales as sharedLocales,
} from '@openagenda/react-shared';
import { getSupportedLocale, mergeLocales } from '@openagenda/intl';
import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import * as commonLocales from '@openagenda/common-labels';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-settings/agendaEdition.js';
import * as appLocales from '../../locales-compiled/index.js';
import * as agendaActions from '../../reducers/agenda.js';
import * as keysActions from '../../reducers/keys.js';
import * as modalsActions from '../../reducers/modals.js';
import I18nContext from '../../contexts/I18nContext.js';

const locales = mergeLocales(
  appLocales,
  reactFiltersLocales,
  sharedLocales,
  commonLocales,
);

function EditionApp({ route }) {
  const { lang } = useLayoutData();

  const i18nContextValue = useMemo(
    () => ({
      lang,
      getLabel: (label, values = {}) =>
        makeGetterLabel(labels)(label, values, lang),
    }),
    [lang],
  );

  const loading = useSelector((state) => state.agenda.loading);

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <I18nContext.Provider value={i18nContextValue}>
        <div className="agenda-settings-edit">
          {loading ? (
            <div style={{ margin: '150px 0' }}>
              <Spinner />
            </div>
          )
            : renderRoutes(route.routes)}
        </div>
      </I18nContext.Provider>
    </IntlProvider>
  );
}

export default redial.provideHooks({
  inject: ({ store }) =>
    store.inject({
      agenda: agendaActions.default,
      keys: keysActions.default,
      modals: modalsActions.default,
    }),
  defer: async ({ store: { dispatch, getState }, params }) => {
    const promises = [];

    // if ( !agendaActions.isLoaded( getState() ) ) {
    //   promises.push( dispatch( agendaActions.load() ) );
    // }

    if (!keysActions.isLoaded(getState(), params.slug)) {
      promises.push(dispatch(keysActions.load(params.slug)));
    }

    return Promise.all(typeof window !== 'undefined' ? [] : promises);
  },
})(EditionApp);
