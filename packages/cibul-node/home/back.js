"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );
const homeMw = require( '@openagenda/home/middleware' );
const sessions = require( '@openagenda/sessions' );
const activitiesMw = require( '@openagenda/activity-apps/dist/middleware' );


module.exports = path => {

  const routes = {
    homeShow: [ 'get', '', [
      cmn.loadBaseData( 'oasfmain.css' ),
      matchApp
    ] ],
    homeEvents: [ 'get', '/events', [
      cmn.loadBaseData( 'oasfmain.css' ),
      matchApp
    ] ],
    homeActivities: [ 'get', '/activities', [
      cmn.loadBaseData( 'oasfmain.css' ),
      matchUserActivitiesApp
    ] ],

    homeShowList: [ 'get', '/agendas', homeMw.agendas.list ],
    homeEventsList: [ 'get', '/events.json', homeMw.events.list ],
    homeActivitiesList: [
      'get', '/activities/list',
      ( req, res ) => activitiesMw.list( { entityType: 'user', entityUid: req.user.uid } )( req, res )
    ]
  };

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'home' ),
    sessions.middleware.load(),
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

  cmn.render( req, res, 'home/index', { scriptParams: { state }, lang, content } );

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
          perPageLimit: homeMw.getConfig().mw.limit,
          isNew: req.user.isNew,
          displayLegacyMessageTab: false,
          userId: req.user.id,
          userUid: req.user.uid
        },
        res: {
          agendas: {
            create: req.genUrl( 'agendaSettingsCreateApp' ),
            list: req.genUrl( 'homeShowList' ),
            show: req.genUrl( 'agendaShow', { slug: ':slug' } ),
            showPrivate: req.genUrl.getPath( 'agendaShowPrivate' ),
            addEvent: req.genUrl( 'agendaEventNew', { slug: ':slug' } ),
            moderate: req.genUrl( 'agendaAdminShow', { slug: ':slug' } ),
            contact: '/:slug/contact'
          },
          events: {
            list: req.genUrl( 'homeEventsList' ),
            show: req.genUrl.getPath( 'agendaEventShow' ),
            showPrivate: req.genUrl.getPath( 'agendaEventShowPrivate' ),
            showWithoutAgenda: req.genUrl.getPath( 'eventShow' ),
            edit: req.genUrl.getPath( 'agendaEventEdit' )
          },
          messages: req.genUrl( 'homeMessages' ),
          notifs: req.genUrl( 'homeNotifications' ),
          search: req.genUrl( 'agendaSearch' )
        }
      }
    },
    prefix,
    getApp
  )( req, res, next );

}

function getUserActivitiesApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};
  const lang = req.lang || 'fr';

  const content = component ? ReactDOM.renderToString( component ) : '';

  cmn.render( req, res, 'activities/user', { scriptParams: { state }, lang, content } );

}


function matchUserActivitiesApp( req, res, next ) {

  const prefix = req.genUrl( 'homeActivities' ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  activitiesMw.matchUserApp(
    {
      state: {
        settings: {
          prefix,
          lang,
          apiRoot: `http://localhost:${config.port}`,
          perPageLimit: homeMw.getConfig().mw.limit
        },
        res: {
          list: req.genUrl( 'homeActivitiesList' )
        }
      }
    },
    prefix,
    getUserActivitiesApp
  )( req, res, next );

}
