import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { trigger } from 'redial';
import du from '@openagenda/dom-utils';
import asyncMatchRoutes from '@openagenda/react-utils/dist/asyncMatchRoutes';
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
  let appToTrigger, components, match, params;

  for ( appToTrigger in apps ) {
    await apps[ appToTrigger ].triggerHooks();

    // ({ components, match, params } = await asyncMatchRoutes(
    //   apps[ appToTrigger ].routes,
    //   history.location.pathname
    // ));
    //
    // const lastMatch = match[ match.length - 1 ];
    //
    // // Break the loop on the first match that is not a NotFound
    // if ( lastMatch && lastMatch.route.path && !(lastMatch.route.component && lastMatch.route.component.isNotFound) ) {
    //   break;
    // }
    //
    // appToTrigger = null;
  }

  // if ( apps[ appToTrigger ] && typeof apps[ appToTrigger ].triggerHooks === 'function' ) {
  //   await apps[ appToTrigger ].triggerHooks();
  // }

  // TODO avoid double render on app change
  //   remove trigger call from the RouterRedialTrigger constructor and detect app change with an history.listen
  //   (0 route.component.isNotFound in the match array)
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
