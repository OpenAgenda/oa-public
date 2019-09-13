"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const createApp = require( '@openagenda/activity-apps/dist/client/apps/agenda' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );

const agendas = require( '@openagenda/agendas' );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'activities' }
);
const members = require('../services/members');

const preMw = [
  cmn.loadLogger( 'agendaActivities' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) ),
  cmn.loadAgenda,
  members.mw.loadAndAuthorize('moderator')
];

const appMw = [
  cmn.loadAgenda,
  ( req, res, next ) => {
    req.agendaFromService = req.agenda;
    next();
  },
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
  matchApp
];


module.exports = app => {

  app.get(
    '/:slug/admin/activities/list',
    preMw,
    ( req, res ) => mw.list( { entityType: 'agenda', entityUid: req.agenda.uid } )( req, res )
  );

  app.get(
    '/:slug/admin/activities',
    preMw,
    appMw
  );

  app.get(
    '/:slug/admin/activities/?*?',
    preMw,
    appMw
  );

};

async function matchApp( req, res, next ) {
  const prefix = `/${req.agenda.slug}/admin/activities`;
  const lang = req.lang || 'fr';
  const { element, triggerHooks, store, staticContext, history } = createApp( {
    req,
    initialState: {
      settings: {
        prefix,
        lang,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        list: `/${req.agenda.slug}/admin/activities/list`,
      }
    }
  } );

  try {
    await triggerHooks();

    const content = ReactDOM.renderToString( element );

    const state = store.getState();

    // Remove apiRoot used only on server side
    state.settings.apiRoot = '';

    if ( staticContext.status === 404 ) {
      return next();
    }

    if ( staticContext.url ) {
      return res.redirect( 302, staticContext.url );
    }

    const { pathname, search } = history.location;
    if ( decodeURIComponent( req.originalUrl ) !== decodeURIComponent( pathname + search ) ) {
      return res.redirect( 302, pathname );
    }

    res.send( layout( `<div class="js_canvas">${content}</div>`, {
      role: req.member.role,
      lang: req.lang,
      agenda: req.agenda,
      bodyAttributes: [
        {
          name: 'data-options',
          value: JSON.stringify( { initialState: state } )
        }
      ],
      scripts: {
        bottom: [ { src: '/js/activitiesAgenda.js' } ]
      }
    } ) );

  } catch ( e ) {
    next( e );
  }
}
