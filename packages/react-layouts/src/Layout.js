import React, { useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { matchRoutes } from 'react-router-config';
import { useHistory, useLocation } from 'react-router-dom';
import { getSupportedLocale } from '@openagenda/intl';
import shallowEqual from 'shallowequal';
import qs from 'qs';
import locales from './locales-compiled';

const defaultLocale = 'fr';

function getVisibleAppsByLayout(apps, pathname, firstOnly) {
  return Object.keys(apps).reduce((accu, appName) => {
    if (firstOnly && accu.length) {
      return accu;
    }

    const { routes } = apps[appName];
    const match = matchRoutes(routes, pathname);
    const app = apps[appName];

    if (match.length) {
      const found = accu.find(v => shallowEqual(v.layout, app.layout));

      if (found) {
        found.apps[appName] = app;
      } else {
        const [layout, ...childLayouts] = Array.isArray(app.layout)
          ? app.layout
          : [app.layout];
        const layoutName = layout.layoutName
          || layout.displayName
          || layout.name
          || `InnerLayout${accu.length}`;

        accu.push({
          key: layoutName,
          layout,
          childLayouts,
          apps: { [appName]: app },
        });
      }
    }

    return accu;
  }, []);
}

const AppsDisplayer = React.memo(
  function AppsDisplayer({ layout: FirstLayout, apps, ...props }) {
    const Comp = componentProps => Object.keys(apps).map(name => React.createElement(apps[name].Content, {
      key: name,
      ...componentProps,
    }));

    return <FirstLayout {...props}>{Comp}</FirstLayout>;
  },
  (prevProps, nextProps) => {
    const {
      apps: prevApps,
      childLayouts: prevLayouts,
      ...prevOthers
    } = prevProps;
    const {
      apps: nextApps,
      childLayouts: nextLayouts,
      ...nextOthers
    } = nextProps;

    return (
      shallowEqual(prevApps, nextApps)
      && shallowEqual(prevLayouts, nextLayouts)
      && shallowEqual(prevOthers, nextOthers)
    );
  }
);

AppsDisplayer.displayName = 'AppsDisplayer';

function Layout({ firstOnly = true, apps, ...props }) {
  const history = useHistory();
  const location = useLocation();

  const translateMode = useSelector(state => state.main.translateMode);
  const userCulture = useSelector(state => state.main.user?.culture);
  const ssrLang = useSelector(state => state.main.lang);

  const userLang = useMemo(
    () => (
      qs.parse(location.search, { ignoreQueryPrefix: true }).lang
        || (translateMode && 'io')
        || userCulture
        || ssrLang
        || (typeof navigator === 'object' && navigator.language)
        || defaultLocale
    ).split('-')[0],
    [location.search, ssrLang, userCulture]
  );

  const i18n = useMemo(() => {
    const usedLocale = locales[userLang] ? userLang : defaultLocale;

    return {
      locale: usedLocale,
      messages: locales[usedLocale],
    };
  }, [userLang]);

  const layouts = useMemo(
    () => getVisibleAppsByLayout(apps, location.pathname, firstOnly),
    [apps, location.pathname, firstOnly]
  );

  return (
    <IntlProvider
      key={i18n.locale}
      messages={i18n.messages}
      locale={i18n.locale}
      defaultLocale={getSupportedLocale(i18n.locale)}
    >
      {layouts.map(layoutProps => (
        <AppsDisplayer
          {...props}
          {...layoutProps}
          history={history}
          lang={i18n.locale}
        />
      ))}
    </IntlProvider>
  );
}

export default Layout;
