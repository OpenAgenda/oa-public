"use strict";

const bodyParser = require( 'body-parser' ),

  cookieParser = require( 'cookie-parser' ),

  app = require( 'test-app' )( {
    frontWrapper: __dirname + '/front.jsx',
    excludeDefaultStyles: true,
    styles: [
      __dirname + '/../../node_modules/bs-templates/compiled/main.css'
    ],
    decorateCanvas: false,
    webpack: true
  } ),

  path = require( 'path' ),

  fixtures = require( 'fixtures' ),

  config = require( '../../testconfig.js' ),

  service = require( '../../service' ),

  mw = service.mw;

app.use( ( req, res, next ) => {
  req.user = { id: 2 };
  next();
} );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( cookieParser() );

app.post( '/', mw.create );
app.post( '/slugs/available', mw.slugs.available );

fixtures.init( config );

fixtures( [ {
  table: 'agenda',
  src: path.resolve( __dirname, '../fixtures/agenda.data.sql' )
} ], err => {

  if ( err ) return console.error( err );

  service.init( config );

  app.getAndListen( '*', 3000 );

} );