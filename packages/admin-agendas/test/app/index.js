"use strict";

var app = require( 'test-app' )( {
    frontWrapper: __dirname + '/front.jsx',
    excludeDefaultStyles: true,
    styles: [
      __dirname + '/../../node_modules/bs-templates/compiled/admin.css'
    ],
    decorateCanvas: false
  } ),

  fixtures = require( '../fixtures' ),

  config = require( '../../testconfig.js' ),

  service = require( '../../service' ),

  mw = service.mw;

app.get( '/', mw.agendas.list );
app.get( '/stakeholders/', mw.stakeholders.list );

// fixtures( ( err, result ) => {

  // if ( err ) return console.error( err );

  service.init( config );

  app.getAndListen();

// } );