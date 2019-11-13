import React, { useMemo } from 'react';
import * as ReactIs from 'react-is';
import { useHistory } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';
import localeFr from './locales/fr';
import localeEn from './locales/en';

const messages = {
  fr: localeFr,
  en: localeEn
};

function getVisibleApps(apps, pathname) {
  return Object.keys(apps).reduce((accu, appName) => {
    const { routes } = apps[appName];
    const match = matchRoutes(routes, pathname);

    if (match.length) {
      accu.push({
        name: appName,
        app: apps[appName]
      });
    }

    return accu;
  }, []);
}

function NoopLayout({ component: Comp, extraProps }) {
  return ReactIs.isValidElementType(Comp)
    ? React.createElement(Comp, { extraProps })
    : Comp;
}

function Layout({ apps, ...props }) {
  const history = useHistory();
  const visibleApps = useMemo(
    () => getVisibleApps(apps, history.location.pathname).map(({ app }, i) => {
      const InnerLayout = app.layout || NoopLayout;

      return (
        <InnerLayout
          key={
              InnerLayout.layoutName
              || InnerLayout.displayName
              || InnerLayout.name
              || `InnerLayout${i}`
            }
          {...props}
          history={history}
          component={app.Content}
        />
      );
    }),
    [apps, history, props]
  );
  const lang = useSelector(state => state.main.lang);

  return (
    <IntlProvider messages={messages[lang]} locale={lang} key={lang}>
      {visibleApps}
    </IntlProvider>
  );
}

export default Layout;
