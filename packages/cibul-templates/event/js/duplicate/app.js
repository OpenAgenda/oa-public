import _ from 'lodash';
import React from 'react';
import { applyMiddleware, compose } from 'redux';
import { Provider, ReactReduxContext } from 'react-redux';
import apiClient from '@openagenda/react-utils/dist/apiClient';
import createStore from '@openagenda/react-utils/dist/createStore';
import clientMiddleware from '@openagenda/react-utils/dist/clientMiddleware';
import agendasReducer from './redux/modules/agendas';
import * as modalsActions from './redux/modules/modals';
import App from './containers/App'

const defaults = {
  initialState: {
    settings: {
      lang: 'fr',
      perPageLimit: 20
    },
    res: {
      agendas: {
        create: '/new',
        list: '/home/agendas'
      }
    },
    agendas: {
      selectAgendasForDuplicate: {
        loading: true
      }
    }
  }
};

export default function duplicateApp( options ) {
  const {
    initialState,
    lang,
    eventUid,
    agendaUid,
    agendaSlug,
    agendaTitle,
    agendaImage
  } = _.merge( {}, defaults, options );

  const client = apiClient( '' );
  const store = createStore(
    () => ({
      agendas: agendasReducer,
      modals: modalsActions.default
    }),
    initialState,
    compose(
      applyMiddleware(
        clientMiddleware( { client } )
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
        eventUid={eventUid}
        agendaUid={agendaUid}
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
