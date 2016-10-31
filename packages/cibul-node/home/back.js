"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( "../lib/moduleLib.js" );
const cmn = require( '../lib/commons-app' );
const homeSvc = require( 'home' );
const mw = homeSvc.mw;

module.exports = path => {

  const routes = {
    homeAgendas: [ 'get', '', [
      cmn.loadBaseData( 'oasfmain.css' ),
      matchApp
    ] ],

    homeAgendasList: [ 'get', '/agendas', mw.agendas.list ]
  };

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'home' ),
    cmn.loadSession,
    cmn.requireLogged()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

}

function getApp( req, res, next, { store, component } = {} ) {

  const prefix = req.genUrl( 'homeAgendas' );
  const state = store ? store.getState() : {};

  // Manually add prefix for react-router matching
  if ( state.routing && state.routing.locationBeforeTransitions ) {
    state.routing.locationBeforeTransitions.basename = prefix;
  }

  const content = component ? ReactDOM.renderToString( component ) : '';

  cmn.render( req, res, 'home/agendas', { scriptParams: { state }, content } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'homeAgendas' );
  const lang = req.lang || 'fr';

  mw.matchApp(
    {
      state: {
        settings: { prefix, lang, apiRoot: `http://localhost:${config.port}` },
        res: {
          list: req.genUrl( 'homeAgendasList' ),
          new: req.genUrl( 'agendaSettingsCreateApp' ),
          events: req.genUrl( 'homeEvents' ),
          messages: req.genUrl( 'homeMessages' ),
          notifs: req.genUrl( 'homeNotifications' ),
          moderate: req.genUrl( 'agendaAdminShow', { slug: ':slug' } ),
          show: req.genUrl( 'agendaShow', { slug: ':slug' } ),
          addEvent: req.genUrl( 'agendaEventNew', { slug: ':slug' } ),
          search: req.genUrl( 'agendaSearch' )
        }
      }
    },
    prefix,
    getApp
  )( req, res, next );

}
