const React = require( 'react' );
const _ = require( 'lodash' );
const ReactDOM = require( 'react-dom/server' );
const path = require( 'path' );
const async = require( 'async' );
const express = require( 'express' );
const fixtures = require( 'fixtures' );
const morgan = require( 'morgan' );
const bodyParser = require( 'body-parser' );
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
  } ], { reset: false }, wcb )
], () => {


  app.use( bodyParser.urlencoded( { extended: false } ) );
  app.use( bodyParser.json() );
  app.use( morgan( 'combined' ) );

  app.use( ( req, res, next ) => {
    req.user = {
      id: 2,
      lang: req.query.lang || 'fr'
    }; // 2 == administrator, 4387 == contributor
    req.identifiers = { userId: req.user.id };
    req.agenda = { id: 4608 };
    next();
  } );

  app.get( '/list', mw.list );

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
    },
    res: {
      list: '/list'
    }
  };

  if ( process.env.NO_SSR ) {
    return getApp( req, res, next, {
      store: { getState: () => state }
    } );
  }

  mw.matchApp(
    { state },
    prefix,
    getApp
  )( req, res, next );

};

function getApp( req, res, next, { store, component } = {} ) {

  const state = store ? store.getState() : {};

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, getHtmlBody() )( req, res );

}

function getHtmlBody() {

  return (
    `<div class="js_canvas">{content}</div>`
  );

}
