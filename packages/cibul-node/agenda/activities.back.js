"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const createApp = require( '@openagenda/activity-apps/dist/client/apps/agenda' );
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
    onUnauthorizedIPAddress: ( req, res, next ) => {

      if ( process.env.NODE_ENV === 'development' ) return next();

      res.redirect( 302, req.genUrl( 'agendaUnauthorized', { slug: req.agendaFromService.slug } ) )

    }
  } ),
  cmn.loadBaseData( 'oasfmain.css' ),
  matchApp
];

module.exports = path => {

  const routes = {

    agendaAdminActivitiesList: [
      'get', '/list',
      ( req, res ) => mw.list( { entityType: 'agenda', entityUid: req.agenda.uid } )( req, res )
    ],

    agendaAdminActivityApps: [ 'get', '', appMw ],
    agendaAdminActivitySub: [ 'get', '/?*?', appMw ]

    /**********/

  };

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'agendaActivities' ),
    sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdminOrModerator
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

};

async function matchApp( req, res, next ) {
  const prefix = req.genUrl( 'agendaAdminActivityApps', { slug: req.agenda.slug } ).split( '?' )[ 0 ];
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
        list: req.genUrl( 'agendaAdminActivitiesList', { slug: req.agenda.slug } ),
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

    cmn.render( req, res, 'activities/agenda', { scriptParams: { initialState: state }, lang, content, preloaded: true } );
  } catch ( e ) {
    next( e );
  }
}
