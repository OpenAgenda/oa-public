"use strict";

const path = require( 'path' );
const logger = require( 'basic-logger' );
const express = require( 'express' );
const morgan = require( 'morgan' );
const bodyParser = require( 'body-parser' );
const sessions = require( '@openagenda/sessions' );
const sessionsMw = require( '@openagenda/sessions/middleware' );
const mailer = require( '@openagenda/mailer' );
const config = require( '../../testconfig.js' );
const mw = require( '../../middleware' )

const helpers = require( '@openagenda/test-app/helpers' );
const app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false,
  webpack: true
} );

const port = process.env.PORT || 3000;

sessions.init( config.services.sessions );
mailer.init( Object.assign( {
  host: config.redis.host,
  port: config.redis.port,
  log: logger( 'mailer' )
}, config.services.mailer ) );

mw.init( { emailDestination: config.emailDestination } );

mailer.task();

app.use( sessionsMw );

app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( bodyParser.json() );
app.use( morgan( 'combined' ) );

app.use( '/js', express.static( path.dirname( require.resolve( '@openagenda/react-form-components/test/app' ) ) + '/js' ) );

app.use( ( req, res, next ) => {
  req.user = {
    uid: 99999999,
    id: 2,
    email: 'kaore.olafsson@gmail.com',
    lang: req.query.lang || 'fr'
  }; // 2 == administrator, 4387 == contributor
  next();
} );

app.use( sessionsMw.open() );

app.post( '/request', mw.request() );

app.getAndListen( '*', port, getApp );

function getApp( req, res, next ) {

  const html = (
    `<h2>Call to action</h2>
    <div class="js_call_to_action btn btn-link" data-subject="aggregator" data-agenda="federation-aqua-poney">
      Cliquez ici !
    </div>
    <div
      id="raw-call-to-action"
      class="btn btn-link"
      data-subject="raw-request"
      data-agenda="fete-des-petits-poneys"
    >
      Brut !
    </div>`
  );

  helpers.renderCanvas( false, false, html )( req, res );

}
