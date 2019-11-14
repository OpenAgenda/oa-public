import React from 'react';
import * as ReactIs from 'react-is';
import { useHistory } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { useSelector, shallowEqual } from 'react-redux';
import { matchRoutes } from '@openagenda/react-utils/dist/asyncMatchRoutes';
import { useMemoOne, useCallbackOne } from './hooks/useMemoOne';
import localeFr from './locales/fr';
import localeEn from './locales/en';

const messages = {
  fr: localeFr,
  en: localeEn
};

function getVisibleAppsByLayout(apps, pathname) {
  return Object.keys(apps).reduce((accu, appName) => {
    const { routes } = apps[appName];
    const match = matchRoutes(routes, pathname);
    const app = apps[appName];

    if (match.length) {
      const found = accu.find(v => v.layout === app.layout);

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

function NoopLayout({ component: Comp, extraProps }) {
  return ReactIs.isValidElementType(Comp)
    ? React.createElement(Comp, { extraProps })
    : Comp;
}

const AppsDisplayer = React.memo(
  ({
    layout: GroupLayout, history, apps, ...props
  }) => {
    const component = useCallbackOne(
      componentProps => Object.keys(apps).map(name => {
        const { Content } = apps[name];

        return <Content key={name} {...componentProps} />;
      }),
      [apps]
    );

    return <GroupLayout history={history} {...props} component={component} />;
  },
  (prevProps, nextProps) => {
    const { apps: prevApps, ...prevOthers } = prevProps;
    const { apps: nextApps, ...nextOthers } = nextProps;

    return (
      shallowEqual(prevApps, nextApps) && shallowEqual(prevOthers, nextOthers)
    );
  }
);

AppsDisplayer.displayName = 'AppsDisplayer';

function Layout({ apps, ...props }) {
  const history = useHistory();

  const visibleAppsByLayout = useMemoOne(
    () => getVisibleAppsByLayout(apps, history.location.pathname),
    [apps, history.location.pathname]
  );

  const layouts = useMemoOne(
    () => visibleAppsByLayout.map(({ layout, visibleApps }, i) => {
      const InnerLayout = layout || NoopLayout;
      const layoutName = InnerLayout.layoutName
          || InnerLayout.displayName
          || InnerLayout.name
          || `InnerLayout${i}`;

      return (
        <AppsDisplayer
          key={layoutName}
          {...props}
          history={history}
          layout={InnerLayout}
          apps={visibleApps}
        />
      );
    }),
    [visibleAppsByLayout, history, props]
  );

  const lang = useSelector(state => state.main.lang);

  return (
    <IntlProvider messages={messages[lang]} locale={lang} key={lang}>
      {layouts}
    </IntlProvider>
  );
}

export default Layout;
