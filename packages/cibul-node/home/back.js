"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const sessions = require( '@openagenda/sessions' );
const homeMw = require( '@openagenda/home/dist/middleware' );
const createActivitiesApp = require( '@openagenda/activity-apps/dist/client/apps/user' );
const activitiesMw = require( '@openagenda/activity-apps/dist/middleware' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );

const preMw = [
  cmn.loadLogger( 'home' ),
  sessions.middleware.ifUnlogged( ( req, res ) => res.redirect( 302, '/' ) )
];

module.exports = app => {

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


async function matchUserActivitiesApp( req, res, next ) {
  const prefix = '/home/activities';
  const lang = req.lang || 'fr';

  const { element, triggerHooks, store, staticContext, history } = createActivitiesApp( {
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
