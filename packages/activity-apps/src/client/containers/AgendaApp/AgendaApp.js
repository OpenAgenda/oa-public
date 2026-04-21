import redial from 'redial';
import { renderRoutes } from 'react-router-config';
import { reducer as formReducer } from 'redux-form';
import { IntlProvider } from 'react-intl';
import { useLayoutData } from '@openagenda/react-shared';
import { mergeLocales, getSupportedLocale } from '@openagenda/intl';
import * as commonLocales from '@openagenda/common-labels';
import modalsReducer from '../../redux/modules/modals.js';
import activitiesReducer from '../../redux/modules/activities.js';
import * as appLocales from '../../../locales-compiled/index.js';

const locales = mergeLocales(appLocales, commonLocales);

function AgendaApp({ route }) {
  const { lang } = useLayoutData();

  return (
    <IntlProvider
      key={lang}
      locale={lang}
      messages={locales[lang]}
      defaultLocale={getSupportedLocale(lang)}
    >
      <div className="activity-agenda-admin">{renderRoutes(route.routes)}</div>
    </IntlProvider>
  );
}

export default redial.provideHooks({
  inject: ({ store }) =>
    store.inject({
      form: formReducer,
      modals: modalsReducer,
      activities: activitiesReducer,
    }),
})(AgendaApp);
