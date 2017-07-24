const React = require( 'react' );
const _ = require( 'lodash' );
const ReactDOM = require( 'react-dom/server' );
const path = require( 'path' );
const async = require( 'async' );
const express = require( 'express' );
const fixtures = require( 'fixtures' );
const morgan = require( 'morgan' );
const bodyParser = require( 'body-parser' );
const sessions = require( 'sessions' );
const sessionsMw = require( 'sessions/middleware' );
const config = require( '../../testconfig.js' );
const activitiesSvc = require( 'activities/test/service' );
const mw = require( '../../middleware' );

const helpers = require( 'test-app/helpers' );
const app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/admin.css'
  ],
  decorateCanvas: false,
  webpack: true
} );

const port = process.env.PORT || 3000;

fixtures.init( config );
sessions.init( config.services.sessions );

async.waterfall( [
  wcb => activitiesSvc.initAndLoad( config, [], wcb ),
  wcb => mw.init( { limit: config.mw.limit }, wcb ),
  wcb => fixtures( [ {
    table: config.schemas.activity,
    src: __dirname + '/../fixtures/activity.data.sql'
  }, {
    table: config.schemas.feed,
    src: __dirname + '/../fixtures/feed.data.sql'
  }, {
    table: config.schemas.feed_activity,
    src: __dirname + '/../fixtures/feed_activity.data.sql'
  }, {
    table: config.schemas.feed_follow,
    src: __dirname + '/../fixtures/feed_follow.data.sql'
  }, {
    table: config.schemas.feed_notification,
    src: __dirname + '/../fixtures/feed_notification.data.sql'
  } ], { reset: false }, wcb )
], () => {

  app.use( ( req, res, next ) => {

    switch ( req.query._app ) {

      case 'agenda':
      case 'user':
      case 'notifications':
        app.setStyles( [ __dirname + '/../../node_modules/bs-templates/compiled/main.css' ] );
      default:
        app.setStyles( [ __dirname + '/../../node_modules/bs-templates/compiled/admin.css' ] );

    }

    next();

  } );

  app.use( sessionsMw );

  app.use( bodyParser.urlencoded( { extended: false } ) );
  app.use( bodyParser.json() );
  app.use( morgan( 'combined' ) );

  app.use( ( req, res, next ) => {
    req.user = {
      uid: 99999999,
      id: 2,
      lang: req.query.lang || 'fr'
    }; // 2 == administrator, 4387 == contributor
    req.userIdentifier = req.user;
    req.identifiers = { userId: req.user.id };
    req.agenda = { id: 4608, uid: 36282888 };
    next();
  } );

  app.use( sessionsMw.open() );

  app.get( '/notifications/count', mw.notifications.count );
  app.get( '/notifications/list', mw.notifications.list );
  app.get( '/notifications/remove/:notifId', mw.notifications.remove );
  app.get( '/notifications/mark-read/:notifId', mw.notifications.markRead );
  app.get( '/notifications/mark-all-read', mw.notifications.markAllRead );

  // for admin
  app.get( '/list', mw.list() );

  // for agenda and user
  app.get(
    '/:uid/list',
    ( req, res ) => mw.list( {
      entityType: req.query._app,
      entityUid: req[ req.query._app ].uid
    } )( req, res )
  );

  app.getAndListen( '*', port, matchApp );

} );


function matchApp( req, res, next ) {

  const prefix = '/';
  const lang = req.query.lang || 'fr';
  const state = {
    settings: {
      prefix,
      lang,
      apiRoot: `http://localhost:${port}`,
      perPageLimit: config.mw.limit
    }
  };

  // Specific state for apps
  switch ( req.query._app ) {
    case 'agenda':
    case 'user':
    case 'admin':
      _.merge( state, {
        res: {
          list: '/list'
        }
      } );
      break;
    case 'notifications':
      return getApp( req, res, next );
  }

  if ( process.env.NO_SSR ) {
    return getApp( req, res, next, { store: { getState: () => state } } );
  }

  // Match apps
  switch ( req.query._app ) {
    case 'agenda':
      mw.matchAgendaApp(
        { state },
        prefix,
        getApp
      )( req, res, next );
      break;
    case 'user':
      mw.matchUserApp(
        { state },
        prefix,
        getApp
      )( req, res, next );
      break;
    case 'admin':
      mw.matchAdminApp(
        { state },
        prefix,
        getApp
      )( req, res, next );
      break;
  }

};

function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, getHtmlBody( req ) )( req, res );

}

function getHtmlBody( req ) {

  if ( req.query._app == 'user' ) {

    return (
      `<div class="js_canvas">{content}</div>`
    );

  } else if ( req.query._app == 'agenda' ) {

    return (
      `<div class="container agenda-admin top-margined">
        <div class="row wsq">
          <div class="col col-sm-3 nav">
            <ul class="list-unstyled">
              <li class="menu-item js_menu_item js_menu_item_activities selected">
                <a class="active" href="/activities?_app=agenda">
                  <span>Activités</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="col-sm-9 body">
            <div class="js_canvas">{content}</div>
          </div>
        </div>
      </div>`
    );

  } else { // admin

    return (
      `<div class="js_canvas">{content}</div>`
    );

  }

}
