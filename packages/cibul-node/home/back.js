"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( "../lib/moduleLib.js" );
const cmn = require( '../lib/commons-app' );
const homeMw = require( 'home/middleware' );
const sessions = require( 'sessions' );


module.exports = path => {

  const routes = {
    homeShow: [ 'get', '', [
      cmn.loadBaseData( 'oasfmain.css' ),
      matchApp
    ] ],

    homeShowList: [ 'get', '/agendas', homeMw.agendas.list ]
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

  const state = store ? store.getState() : {};
  const lang = req.lang || 'fr';

  const content = component ? ReactDOM.renderToString( component ) : '';

  cmn.render( req, res, 'home/agendas', { scriptParams: { state }, lang, content } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'homeShow' ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  homeMw.matchApp(
    {
      state: {
        settings: {
          prefix,
          lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: homeMw.getConfig().mw.limit
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
