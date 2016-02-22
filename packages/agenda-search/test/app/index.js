"use strict";


var app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false
} ),

fixtures = require( '../fixtures' ),

config = require( '../../testconfig.js' ),

service = require( '../../service' ),

mw = service.mw;

app.get( '/', mw.list );

fixtures( ( err, result ) => {

  service.init( config );
  
  service.rebuild( () => app.getAndListen() );

} );