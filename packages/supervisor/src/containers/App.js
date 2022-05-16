import React from 'react';
import { IntlProvider } from 'react-intl';
import {
  Switch, Route, Link, useRouteMatch
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { loadable, useConstant, useLayoutData } from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import locales from '../locales-compiled';

const AnnouncementManager = loadable(
  () => import(
    /* webpackChunkName: "supervisor-AnnouncementManager" */
    './AnnouncementManager'
  ),
  { ssr: false }
);

const Elasticsearch = loadable(
  () => import(
    /* webpackChunkName: "supervisor-Elasticsearch" */
    './Elasticsearch'
  ),
  { ssr: false }
);

function App({ user }) {
  const { lang } = useLayoutData();
  const queryClient = useConstant(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    })
  );

  const { path, url } = useRouteMatch();

  const normalizedPath = url.endsWith('/') ? url.slice(0, -1) : url;

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider
        key={lang}
        locale={lang}
        messages={locales[lang]}
        defaultLocale={getSupportedLocale(lang)}
      >
        <div className="supervisor">
          <Switch>
            <Route exact path={path}>
              <div className="container">
                <div className="row">
                  <h2>
                    Bienvenue chez les <b>super</b>admins !
                  </h2>

                  <ul>
                    <li>
                      <Link to={`${normalizedPath}/announcement`}>
                        Gérer les annonces OA
                      </Link>
                    </li>
                    <li>
                      <Link to={`${normalizedPath}/elasticsearch`}>
                        Elasticsearch
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </Route>

            <Route path={`${normalizedPath}/announcement`}>
              <AnnouncementManager user={user} />
            </Route>

            <Route path={`${normalizedPath}/elasticsearch`}>
              <Elasticsearch user={user} />
            </Route>
          </Switch>
        </div>
      </IntlProvider>
    </QueryClientProvider>
  );
}

export default App;
