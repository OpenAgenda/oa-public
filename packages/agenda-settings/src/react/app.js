import _ from 'lodash';
import React from 'react';
import { Provider, ReactReduxContext } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { Router, useRouterHistory } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';
import { ReduxAsyncConnect } from 'redux-connect';
import createStore from './redux/create';
import ApiClient from '../helpers/ApiClient';

export default function ( options, routes, fn ) {

  const params = _.merge( {
    state: {
      settings: {
        lang: 'fr',
        prefix: ''
      },
      res: {}
    }
  }, options );

  const client = new ApiClient( params.state.settings.apiRoot );
  const browserHistory = useRouterHistory( createHistory )();
  const store = createStore( browserHistory, client, params.state );
  const history = syncHistoryWithStore( browserHistory, store );

  const renderRouter = props => {
    return <ReduxAsyncConnect {...props} helpers={{ client }} filter={item => !item.deferred} history={history} />;
  }

  if ( fn ) fn( { client, store, history } );

  return (
    <Provider store={store} key="provider" context={ReactReduxContext}>
      <Router history={history} render={renderRouter}>
        {routes( store )}
      </Router>
    </Provider>
  );

};
