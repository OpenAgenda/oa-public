"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const { parsePath } = require('history');
const sessions = require( '@openagenda/sessions' );
const mw = require( '@openagenda/activity-apps/dist/middleware' );
const createApp = require( '@openagenda/activity-apps/dist/client/apps/admin' );
const config = require( '../config' );
const cmn = require( '../lib/commons-app' );

const appMw = [
  cmn.loadBaseData( 'oa-admin.css' ),
  matchApp
];

const preMw = [
  cmn.loadLogger( 'activities' ),
  sessions.mw.ifUnlogged( cmn.redirectToSignin ),
  cmn.requireSuperAdmin
];

module.exports = app => {

  app.get( '/admin/activities', preMw, appMw );
  app.get( '/admin/activities(/*?)?', preMw, appMw );
  app.get( '/admin/activities/list', preMw, mw.list() );

};

async function matchApp( req, res, next ) {
  const prefix = '/admin/activities';
  const lang = req.lang || 'fr';
  const { element, triggerHooks, store, staticContext, history } = createApp( {
    req,
    initialState: {
      settings: {
        prefix,
        apiRoot: `http://localhost:${config.port}`,
        perPageLimit: 20
      },
      res: {
        list: '/admin/activities/list'
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

    const { pathname } = history.location;
    if (decodeURIComponent(parsePath(req.originalUrl).pathname) !== decodeURIComponent(pathname)) {
      return res.redirect( 302, pathname );
    }

    cmn.render(
      req,
      res,
      'admin/activities',
      { scriptParams: { initialState: state, lang }, lang, content, preloaded: true, key: 'activities' }
    );
  } catch ( e ) {
    next( e );
  }
}
