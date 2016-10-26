"use strict";

const React = require( 'react' );
const ReactDOM = require( 'react-dom/server' );
const config = require( '../../testconfig.js' );
const service = require( '../../service' );
const agendasSvc = require( 'agendas/service/test' );
const mw = service.mw;

const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const cookieParser = require( 'cookie-parser' );
const morgan = require( 'morgan' );

const helpers = require( 'test-app/helpers' );
const app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false,
  webpack: true
} );

const port = process.env.PORT || 3000;

app.use( '/js', express.static( __dirname + '/js' ) );

app.use( ( req, res, next ) => {
  req.user = { id: 2 };
  next();
} );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( cookieParser() );

app.use( morgan( ':method :url :status ":user-agent" :response-time ms - :res[content-length]' ) );

app.post( '/', mw.create );
app.get( '/:uid/agenda.json', mw.get );
app.post( '/:slug/edit', mw.set );
app.post( '/:slug/setImage', mw.setImage );
app.post( '/:slug/clearImage', mw.clearImage );
app.post( '/slugs/available', mw.slugs.available );
app.post( '/:slug/remove', [
  mw.removeAgenda,
  ( req, res ) => {
    res.json( { redirectTo: '/' } );
  }
] );


function matchApp( req, res, next ) {

  const prefix = '';
  const lang = req.query.lang || 'fr';

  if ( req.query._app == 'edition' ) {

    mw.matchApp(
      'edit',
      {
        state: {
          settings: { prefix, lang, apiRoot: `http://localhost:${port}` },
          res: {
            get: '/:uid/agenda.json',
            set: '/:slug/edit',
            slugAvailable: '/slugs/available',
            uploadImage: '/:slug/setImage',
            clearImage: '/:slug/clearImage',
            remove: '/:slug/remove'
          },
          agenda: {
            uid: '17026855'
          }
        }
      },
      prefix,
      getApp
    )( req, res, next );

  } else { // creation app

    mw.matchApp(
      'create',
      {
        state: {
          settings: { prefix, lang, apiRoot: `http://localhost:${port}` },
          res: {
            create: '',
            slugAvailable: '/slugs/available',
            onCreated: ''
          }
        }
      },
      prefix,
      getApp
    )( req, res, next );

  }

};

function getApp( req, res, next, { store, component } = {} ) {

  const prefix = '';
  const state = store ? store.getState() : {};

  // Manually add prefix for react-router matching
  if ( state.routing && state.routing.locationBeforeTransitions ) {
    state.routing.locationBeforeTransitions.basename = prefix;
  }

  req.data = { state };
  req.content = component ? ReactDOM.renderToString( component ) : '';

  helpers.renderCanvas( true, false, getHtmlBody( req ) )( req, res );

}

function getHtmlBody( req ) {

  if ( req.query._app == 'edition' ) {

    return (
      `<div class="container agenda-admin top-margined">
        <div class="row wsq">
          <div class="col col-sm-3 nav">
            <ul class="list-unstyled">
              <li class="menu-item js_menu_item js_menu_item_settings_profile selected">
                <a class="active" href="/profile?_app=edition">
                  <span>Paramètres</span>
                </a>
              </li>
              <li class="menu-item js_menu_item js_menu_item_settings_contribution">
                <a href="/contribution?_app=edition">
                  <span>Contribution</span>
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

  } else { // creation

    return '<div class="js_canvas">{content}</div>';

  }

}


agendasSvc.init( config );


if ( ( process.argv || [] ).indexOf( 'fixtures' ) !== -1 ) {

  agendasSvc.test.fixtures( err => {

    if ( err ) return console.error( err );

    run();

  } );

} else {

  run();

}


function run() {

  service.init( Object.assign( config, {
    services: {
      agendas: agendasSvc
    }
  } ) );

  app.getAndListen( '*', port, matchApp );

}
