"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
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


function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};
  const lang = req.lang || 'fr';

  const content = component ? ReactDOM.renderToString( component ) : '';

  cmn.render( req, res, 'admin/activities', { scriptParams: { state }, lang, content, key: 'activities' } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'adminActivitiesApp' ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  mw.matchAdminApp(
    {
      state: {
        settings: {
          prefix,
          lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: 20
        },
        res: {
          list: req.genUrl( 'adminActivitiesList' ),
        }
      }
    },
    prefix,
    getApp
  )( req, res, next );

}
