import { applyMiddleware, compose } from 'redux';
import {
  apiClient,
  createStore,
  clientMiddleware,
} from '@openagenda/react-shared';
import mainReducer from './reducers/main';
import agendaAdminReducer from './reducers/agendaAdmin';

const CLIENT = typeof window !== 'undefined';
const DEVELOPMENT = process.env.NODE_ENV === 'development';

export default function createLayoutStore(initialState, history) {
  const helpers = {};
  const client = apiClient(initialState.main.apiRoot);

  const store = createStore(
    asyncReducers => ({
      main: mainReducer,
      agendaAdmin: agendaAdminReducer,
      ...asyncReducers,
    }),
    initialState,
    compose(
      applyMiddleware(clientMiddleware({ client })),
      CLIENT && DEVELOPMENT && window.__REDUX_DEVTOOLS_EXTENSION__
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : v => v
    )
  );

  Object.assign(helpers, {
    client,
    store,
    history,
    location: history.location,
  });

  return store;
}
