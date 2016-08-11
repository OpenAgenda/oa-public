"use strict";

var app = require( 'test-app' )( {
    frontWrapper: __dirname + '/front.jsx',
    excludeDefaultStyles: true,
    styles: [
      __dirname + '/../../node_modules/bs-templates/compiled/admin.css'
    ],
    decorateCanvas: false,
    webpack: true
  } ),

  fixtures = require( '../fixtures' ),

  config = require( '../../testconfig.js' ),

  service = require( '../../service' ),

  bodyParser = require('body-parser'),

  mw = service.mw;

app.use( bodyParser.json() );

app.get( '/', mw.agendas.list );
app.get( '/get', mw.agendas.get );
app.post( '/set/:uid', mw.agendas.set );
app.get( '/stakeholders', mw.stakeholders.list );

fixtures( ( err, result ) => {

  if ( err ) return console.error( err );

  service.init( config );

  app.getAndListen();

} );