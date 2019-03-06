import React  from 'react';
import createStore from '@openagenda/react-utils/dist/createStore';
import Context from './contexts/header';
import headerReducer from './headerReducer';


const HeaderManager = ( { children, store } ) => (
  <Context.Provider value={store}>
    {children}
  </Context.Provider>
);

HeaderManager.createStore = initialState => createStore(
  () => ({ header: headerReducer }),
  initialState
);

HeaderManager.Context = Context;

export default HeaderManager;
