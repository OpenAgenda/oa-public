import { IntlProvider } from 'react-intl';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  loadableComponent,
  useConstant,
  useLayoutData,
} from '@openagenda/react-shared';
import { getSupportedLocale } from '@openagenda/intl';
import * as locales from '../locales-compiled/index.js';

// eslint-disable-next-line camelcase
const contextRequire = typeof __webpack_require__ !== 'undefined'
  ? import.meta.webpackContext('.', {
    recursive: true,
    regExp: /\.js$/,
    mode: 'weak',
  })
  : null;

const AnnouncementManager = loadableComponent(
  {
    chunkName: 'supervisor-AnnouncementManager',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-AnnouncementManager" */
        './AnnouncementManager.js'
      ),
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./AnnouncementManager.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./AnnouncementManager.js');
      }
    },
  },
  { ssr: false },
);

const Elasticsearch = loadableComponent(
  {
    chunkName: 'supervisor-Elasticsearch',
    importAsync: () =>
      import(
        /* webpackChunkName: "supervisor-Elasticsearch" */
        './Elasticsearch.js'
      ),
    resolve: () => {
      if (contextRequire) {
        return contextRequire.resolve('./Elasticsearch.js');
      }
      const { resolve } = import.meta;
      if (typeof resolve === 'function') {
        return resolve('./Elasticsearch.js');
      }
    },
  },
  { ssr: false },
);

function App({ user }) {
  const { lang } = useLayoutData();
  const queryClient = useConstant(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const { path, url } = useRouteMatch();

  const normalizedPath = url.endsWith('/') ? url.slice(0, -1) : url;

  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider
        key={lang}
        locale={lang}
        // eslint-disable-next-line import/namespace
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
                    <li>
                      <a href={`${normalizedPath}/bullboard`}>Bullboard</a>
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
