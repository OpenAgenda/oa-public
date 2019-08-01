"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const homeMw = require( '@openagenda/home/dist/middleware' );
const createApp = require( '@openagenda/home/dist/client/app' );
const createActivitiesApp = require( '@openagenda/activity-apps/dist/client/apps/user' );
const activitiesMw = require( '@openagenda/activity-apps/dist/middleware' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );

const phpPrefix = __DEVELOPMENT__ ? '/frontend_dev.php' : '';

const preMw = [
  cmn.loadLogger( 'home' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
];

module.exports = app => {

  app.get(
    '/home',
    preMw,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchApp
  );

  app.get(
    '/home/events',
    preMw,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchApp
  );

  app.get(
    '/home/activities',
    preMw,
    cmn.loadBaseData( 'oasfmain.css' ),
    matchUserActivitiesApp
  );

  app.get(
    '/home/agendas',
    preMw,
    homeMw.agendas.list
  );

  app.get(
    '/home/events.json',
    preMw,
    homeMw.events.list
  );

  app.get(
    '/home/activities/list',
    preMw,
    ( req, res ) => activitiesMw.list( { entityType: 'user', entityUid: req.user.uid } )( req, res )
  );

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
          create: '/new',
          list: '/home/agendas',
          show: '/:slug',
          showPrivate: '/:slug.prv',
          addEvent: `${phpPrefix}/:slug/addevent`,
          moderate: `${phpPrefix}/:slug/admin`,
          contact: '/:slug/contact'
        },
        events: {
          list: '/home/events.json',
          show: '/:slug/events/:eventSlug',
          showPrivate: '/:slug.prv/events/:eventSlug',
          showWithoutAgenda: '/events/:eventSlug',
          edit: `${phpPrefix}/:slug/event/:eventSlug/edit`
        },
        messages: '/home/messages',
        notifs: '/home/notifications',
        search: '/agendas'
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
  const prefix = '/home/activities';
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
        list: '/home/activities/list'
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
