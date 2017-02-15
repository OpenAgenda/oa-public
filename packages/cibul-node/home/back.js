"use strict";

const React = require( 'react' ),

 ReactDOM = require( 'react-dom/server' ),

 config = require( '../config' ),

 modLib = require( "../lib/moduleLib.js" ),

 cmn = require( '../lib/commons-app' ),

 home = require( 'home' ),

 homeConfig = home.getConfig(),

 sessions = require( 'sessions' );

module.exports = path => {

  const routes = {
    homeShow: [ 'get', '', [
      cmn.loadBaseData( 'oasfmain.css' ),
      matchApp
    ] ],

    homeShowList: [ 'get', '/agendas', home.mw.agendas.list ]
  };

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'home' ),
    sessions.middleware.load( { detailed: true } ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

}

function getApp( req, res, next, { store, component } = {} ) {

  // const prefix = req.genUrl( 'homeAgendas' ).split( '?' )[ 0 ];
  const state = store ? store.getState() : {};
  const lang = req.lang || 'fr';

  // Manually add prefix for react-router matching
  /*if ( state.routing && state.routing.locationBeforeTransitions ) {
    state.routing.locationBeforeTransitions.basename = prefix;
  }*/

  const content = component ? ReactDOM.renderToString( component ) : '';

  cmn.render( req, res, 'home/agendas', { scriptParams: { state }, lang, content } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'homeShow' ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  home.mw.matchApp(
    {
      state: {
        settings: {
          prefix,
          lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: homeConfig.mw.limit
        },
        res: {
          list: req.genUrl( 'homeShowList' ),
          new: req.genUrl( 'agendaSettingsCreateApp' ),
          events: req.genUrl( 'homeEvents' ),
          messages: req.genUrl( 'homeMessages' ),
          notifs: req.genUrl( 'homeNotifications' ),
          moderate: req.genUrl( 'agendaAdminShow', { slug: ':slug' } ),
          show: req.genUrl( 'agendaShow', { slug: ':slug' } ),
          showPrivate: req.genUrl.getPath( 'agendaShowPrivate' ),
          addEvent: req.genUrl( 'agendaEventNew', { slug: ':slug' } ),
          search: req.genUrl( 'agendaSearch' )
        }
      }
    },
    prefix,
    getApp
  )( req, res, next );

}
