import React from 'react';
import * as ReactIs from 'react-is';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import shallowEqual from 'shallowequal';
import qs from 'qs';
import { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';
import { useMemoOne } from '@openagenda/react-shared/dist/hooks/useMemoOne';
import localeFr from './locales/fr.json';
import localeEn from './locales/en.json';

const messages = {
  fr: localeFr,
  en: localeEn
};
const defaultLocale = 'fr';

function getVisibleAppsByLayout(apps, pathname) {
  return Object.keys(apps).reduce((accu, appName) => {
    const { routes } = apps[appName];
    const match = matchRoutes(routes, pathname);
    const app = apps[appName];

    if (match.length) {
      const found = accu.find(v => shallowEqual(v.layout, app.layout));

      if (found) {
        found.visibleApps[appName] = app;
      } else {
        accu.push({
          layout: app.layout,
          visibleApps: { [appName]: app }
        });
      }
    }

    return accu;
  }, []);
}

function NoopLayout({ children, ...props }) {
  return ReactIs.isValidElementType(children)
    ? React.createElement(children, props)
    : children;
}

const AppsDisplayer = React.memo(
  ({ layout: FirstLayout, apps, ...props }) => {
    const Comp = componentProps => Object.keys(apps).map(name => React.createElement(apps[name].Content, {
      key: name,
      ...componentProps
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

function Layout({ apps, ...props }) {
  const history = useHistory();
  const location = useLocation();

  const userCulture = useSelector(state => state.main.user?.culture);
  const ssrLang = useSelector(state => state.main.lang);

  const userLang = useMemoOne(
    () => (
      qs.parse(location.search, { ignoreQueryPrefix: true }).lang
        || userCulture
        || ssrLang
        || (typeof navigator === 'object' && navigator.language)
        || defaultLocale
    ).split('-')[0],
    [location.search, ssrLang, userCulture]
  );

  const i18n = useMemoOne(() => {
    const usedLocale = messages[userLang] ? userLang : defaultLocale;

    return {
      locale: usedLocale,
      messages: messages[usedLocale]
    };
  }, [userLang]);

  const visibleAppsByLayout = useMemoOne(
    () => getVisibleAppsByLayout(apps, location.pathname),
    [apps, location.pathname]
  );

  const layouts = useMemoOne(
    () => visibleAppsByLayout.map(({ layout, visibleApps }, i) => {
      const [FirstLayout, ...childLayouts] = (Array.isArray(layout)
        ? layout
        : [layout]) || [NoopLayout];
      const layoutName = FirstLayout.layoutName
          || FirstLayout.displayName
          || FirstLayout.name
          || `InnerLayout${i}`;

      return (
        <AppsDisplayer
          key={layoutName}
          {...props}
          history={history}
          layout={FirstLayout}
          childLayouts={childLayouts}
          apps={visibleApps}
          lang={i18n.locale}
        />
      );
    }),
    [visibleAppsByLayout, props, history, i18n.locale]
  );

  return (
    <IntlProvider
      messages={i18n.messages}
      locale={i18n.locale}
      defaultLocale={defaultLocale}
      otherKey={i18n.locale}
    >
      {layouts}
    </IntlProvider>
  );
}

export default Layout;
