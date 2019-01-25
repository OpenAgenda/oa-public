"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const createApp = require( '@openagenda/activity-apps/dist/client/apps/admin' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );

const appMw = [
  cmn.loadBaseData( 'compiledAdmin.css' ),
  matchApp
];

const routes = {

  adminActivitiesApp: [ 'get', '', appMw ],
  adminActivitiesSub: [ 'get', '/?*?', appMw ],

  /**********/

  adminActivitiesList: [ 'get', '/list', mw.list() ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'activities' ),
    sessions.middleware.load( { detailed: true } ),
    sessions.middleware.ifUnlogged( cmn.redirectToSignin ),
    cmn.requireAdmin
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};

async function matchApp( req, res, next ) {
  const prefix = req.genUrl( 'adminActivitiesApp' ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';
  const { element, triggerHooks, store, context } = createApp( {
    req,
    initialState: {
      settings: {
        prefix,
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        list: req.genUrl( 'adminActivitiesList' )
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

    cmn.render(
      req,
      res,
      'admin/activities',
      { scriptParams: { initialState: state }, lang, content, preloaded: true, key: 'activities' }
    );
  } catch ( e ) {
    next( e );
  }
}
