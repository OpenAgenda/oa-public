import _ from 'lodash';
import React from 'react';
import { applyMiddleware, compose } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import { apiClient, createStore, clientMiddleware } from '@openagenda/react-shared';
import agendasReducer from './redux/modules/agendas';
import * as modalsActions from './redux/modules/modals';
import App from './containers/App'

const defaults = {
  initialState: {
    eventUid: null,
    agendaUid: null,
    settings: {
      perPageLimit: 20
    },
    res: {
      agendas: {
        create: '/agendas/new',
        list: '/home/agendas'
      }
    },
    agendas: {
      initialized: false,
      selectAgendasForDuplicate: {
        loading: true
      }
    }
  }
};

export default function duplicateApp(options) {
  const {
    initialState,
    lang,
    eventUid,
    agendaUid,
    agendaSlug,
    agendaTitle,
    agendaImage
  } = _.merge({}, defaults, options);

  initialState.eventUid = eventUid;
  initialState.agendaUid = agendaUid;

  const client = apiClient('', null, { legacy: true });
  const store = createStore(
    () => ({
      agendas: agendasReducer,
      modals: modalsActions.default
    }),
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware({ client })
        // ... other middlewares ... (like redux-logger)
     ),
      __CLIENT__ && __DEVELOPMENT__ && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
   )
 );

  const element = (
    <Provider store={store} context={ReactReduxContext}>
      <App
        lang={lang}
        agendaSlug={agendaSlug}
        agendaTitle={agendaTitle}
        agendaImage={agendaImage}
      />
    </Provider>
 );

  return {
    element,
    store
  };
}
