import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import du from '@openagenda/dom-utils';
import createAppHome from '@openagenda/home/dist/client/app';
import createAppUserSettings from '@openagenda/user-apps/dist/app';
import NotFoundDisplayer from './NotFoundDisplayer';

const history = createBrowserHistory();
const { initialState } = JSON.parse( document.querySelector( 'body' ).getAttribute( 'data-options' ) );

// create apps with the good initialState
const apps = {
  home: createAppHome( {
    history,
    initialState: initialState.home
  } ),
  userSettings: createAppUserSettings( {
    history,
    initialState: initialState.userSettings
  } )
};


(async () => {
  // TODO wrap each app in a LayoutDisplayer

  ReactDOM.render(
    <>
      {Object.entries( apps ).map( ( [ key, { element } ] ) =>
        React.cloneElement( element, { key, ...element.props } ) )}

      <NotFoundDisplayer apps={apps} history={history}>
        <div>Not found !</div>
      </NotFoundDisplayer>
    </>,
    du.el( '.js_canvas' )
  );
})();
