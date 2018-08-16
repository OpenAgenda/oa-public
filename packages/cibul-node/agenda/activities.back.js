"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const bodyParser = require( 'body-parser' );
const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );

// to be deprecated
const agendaSvc = require( '../services/agenda' );

const agendas = require( '@openagenda/agendas' );

const appMw = [
  agendaSvc.mw.loadAdminLayout,
  agendas.middleware.load( {
    namespaces: {
      identifiers: { slug: 'params.slug' },
      result: 'agendaFromService'
    },
    private: null
  } ),
  agendas.middleware.evaluateIPAddress( {
    private: null,
    namespaces: {
      agenda: 'agendaFromService'
    },
    onUnauthorizedIPAddress: ( req, res, next ) => res.redirect( 302, req.genUrl( 'agendaUnauthorized', { slug: req.agendaFromService.slug } ) )
  } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  matchApp
];

module.exports = path => {

  const routes = {

    agendaAdminActivityApps: [ 'get', '', appMw ],
    agendaAdminActivitySub: [ 'get', '/?*?', appMw ],

    /**********/

    agendaAdminActivitiesList: [
      'get', '/list',
      ( req, res ) => mw.list( { entityType: 'agenda', entityUid: req.agenda.uid } )( req, res )
    ]

  };

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'agendaActivities' ),
    sessions.middleware.ifUnlogged( cmn.redirectTo() ),
    sessions.middleware.load( { detailed: true } ),
    bodyParser.json(),
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdminOrModerator
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

  cmn.render( req, res, 'activities/agenda', { scriptParams: { state }, lang, content } );

}

function matchApp( req, res, next ) {

  const prefix = req.genUrl( 'agendaAdminActivityApps', { slug: req.agenda.slug } ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  mw.matchAgendaApp(
    {
      state: {
        settings: {
          prefix,
          lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: 20
        },
        res: {
          list: req.genUrl( 'agendaAdminActivitiesList', { slug: req.agenda.slug } ),
        }
      }
    },
    prefix,
    getApp
  )( req, res, next );

}
