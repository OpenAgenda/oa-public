"use strict";

var app = require( 'test-app' )( {
    frontWrapper: __dirname + '/front.jsx',
    excludeDefaultStyles: true,
    styles: [
      __dirname + '/../../node_modules/bs-templates/compiled/main.css'
    ],
    decorateCanvas: false,
    redux: true
  } ),

  fixtures = require( 'fixtures' ),

  config = require( '../../testconfig.js' ),

  service = require( '../../service' );

  // mw = service.mw;

// app.get( '/', mw.agendas.list );
// app.get( '/stakeholders/', mw.stakeholders.list );

fixtures.init( config );

fixtures( [ {
  table: 'user',
  src: __dirname + '/../fixtures/user.data.sql'
}, {
  table: 'apiKeySet',
  src: __dirname + '/../fixtures/api_key_set.data.sql'
} ], err => {

  if ( err ) return console.error( err );

  service.init( config );

  app.getAndListen();

} );