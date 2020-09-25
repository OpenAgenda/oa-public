import React from 'react';
import { hot } from 'react-hot-loader/root';
import { IntlProvider } from 'react-intl';
import { useSelector } from 'react-redux';
import {
  Switch, Route, Link, useRouteMatch
} from 'react-router-dom';
import loadable from '@openagenda/react-utils/dist/loadable';
import locales from '../locales-compiled';

const AnnouncementManager = loadable(() => import(
  /* webpackChunkName: "supervisor-AnnouncementManager" */
  './AnnouncementManager'
));

const Elasticsearch = loadable(() => import(
  /* webpackChunkName: "supervisor-Elasticsearch" */
  './Elasticsearch'
));

function App({ user }) {
  const { path, url } = useRouteMatch();
  const lang = useSelector(state => state.settings.lang);

  const normalizedPath = url.endsWith('/') ? url.slice(0, -1) : url;

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
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
  );
}

export default hot(App);
