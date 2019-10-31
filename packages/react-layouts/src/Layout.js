import React, { useMemo } from 'react';
import * as ReactIs from 'react-is';
import { useLocation } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { matchRoutes, getParams } from '@openagenda/react-utils/dist/asyncMatchRoutes';
import localeFr from './locales/fr';
import localeEn from './locales/en';

const messages = {
  fr: localeFr,
  en: localeEn
};

function getVisibleApps(apps, pathname) {
  return Object.keys(apps)
    .reduce((accu, appName) => {
      const { routes } = apps[appName];
      const match = matchRoutes(routes, pathname);

      if (match.length) {
        accu.push({
          name: appName,
          app: apps[appName],
          params: getParams(match),
          match
        })
      }

      return accu;
    }, []);
}

function NoopLayout({ component: Comp, extraProps }) {
  return ReactIs.isValidElementType(Comp)
    ? React.createElement(Comp, { extraProps })
    : Comp;
}

export default React.memo(function Layout({ apps, ...props }) {
  const location = useLocation();
  const visibleApps = useMemo(
    () => getVisibleApps(apps, location.pathname),
    [apps, location.pathname]
  );
  const lang = useSelector(state => state.main.lang);

  return (
    <IntlProvider messages={messages[lang]} locale={lang} key={lang}>
      {visibleApps
        .map(({ name, app, params, match }) => {
          const InnerLayout = app.layout || NoopLayout;

          return (
            <InnerLayout
              key={name}
              {...props}
              params={params}
              match={match}
              component={app.Content}
            />
          );
        })}
    </IntlProvider>
  );
});
