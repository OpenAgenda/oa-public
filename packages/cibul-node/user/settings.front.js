"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const createApp = require( '@openagenda/user-apps/dist/app' );
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );

const logged = sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) );


module.exports = app => {

  app.get(
    [ '/settings', '/settings/*' ],
    cmn.loadLogger( 'userSettings' ),
    cmn.loadBaseData( 'oasfmain.css' ),
    logged,
    matchApp
  );

};

async function matchApp( req, res, next ) {
  const lang = req.lang || 'fr';
  const { element, triggerHooks, store, context } = createApp( {
    req,
    initialState: {
      settings: {
        prefix: '/settings',
        lang,
        apiRoot: `http://localhost:${config.port}`
      },
      res: {
        getMe: '/users/me',
        updateProfile: '/users/me',
        deleteAccount: '/users/me',
        changeEmail: '/users/me/requestChangeEmail',
        changePassword: '/users/me/changePassword',
        generateApiKey: '/users/me/generateApiKey',
        uploadProfileImage: '/users/me/setImageProfile',
        removeProfileImage: '/users/me/clearImageProfile'
      }
    }
  } );

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( context.status === 404 ) {
      return next();
    }

    if ( context.url ) {
      return res.redirect( 301, context.url );
    }

    const { pathname, search } = state.router.location;
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 301, pathname );
    }

    cmn.render( req, res, 'user/settings', { scriptParams: { initialState: state }, lang, content, preloaded: true } );
  } catch ( e ) {
    next( e );
  }
}
