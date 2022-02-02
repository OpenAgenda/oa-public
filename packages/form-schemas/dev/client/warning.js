import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Link,
  Route
} from 'react-router-dom';

import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import { locales } from '@openagenda/react-shared';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

const props = {
  lang: 'fr',
  unloadWarning: {
    page: true,
    router: true
  },
  schema: {
    fields: [{
      field: 'bewarned',
      fieldType: 'text',
      label: 'Soyez avertis'
    }]
  }
};

render(
  <IntlProvider locale="fr" key="fr" messages={locales.fr}>
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>Type something then reload page.</p>
        <Router>
          <ul className="list-unstyled">
            <li>
              <Link to="/">Main (start here)</Link>
            </li>
            <li>
              <Link to="/other">Other (leave main)</Link>
            </li>
          </ul>
          <Switch>
            <Route path="/" exact>
              <FormSchemaComponent {...props} />
            </Route>
            <Route path="/other">
              <p>Other</p>
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  </IntlProvider>,
  document.getElementById('app')
);
