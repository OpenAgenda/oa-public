"use strict";


const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const homeMw = require( '@openagenda/home/dist/middleware' );
const createApp = require( '@openagenda/home/dist/client/app' );
const createActivitiesApp = require( '@openagenda/activity-apps/dist/client/apps/user' );
const activitiesMw = require( '@openagenda/activity-apps/dist/middleware' );
const config = require( '../config' );
const modLib = require( '../lib/moduleLib.js' );
const cmn = require( '../lib/commons-app' );


module.exports = path => {

  const routes = {
    homeShow: [
      'get', '/', [
        cmn.loadBaseData( 'oasfmain.css' ),
        matchApp
      ]
    ],
    homeEvents: [
      'get', '/events', [
        cmn.loadBaseData( 'oasfmain.css' ),
        matchApp
      ]
    ],
    homeActivities: [
      'get', '/activities', [
        cmn.loadBaseData( 'oasfmain.css' ),
        matchUserActivitiesApp
      ]
    ],

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

async function matchApp( req, res, next ) {
  const lang = req.lang || 'fr';
  const { element, triggerHooks, store, context } = createApp( {
    req,
    initialState: {
      settings: {
        prefix: '/home',
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
          contribute: '/:slug/contribute',
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

    cmn.render( req, res, 'home/index', { scriptParams: { initialState: state }, lang, content, preloaded: true } );
  } catch ( e ) {
    next( e );
  }
}


async function matchUserActivitiesApp( req, res, next ) {
  const prefix = req.genUrl( 'homeActivities' ).split( '?' )[ 0 ];
  const lang = req.lang || 'fr';

  const { element, triggerHooks, store, context } = createActivitiesApp( {
    req,
    initialState: {
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
      'activities/user',
      { scriptParams: { initialState: state }, lang, content, preloaded: true }
    );
  } catch ( e ) {
    next( e );
  }
}
