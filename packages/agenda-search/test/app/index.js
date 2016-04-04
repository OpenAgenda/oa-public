"use strict";


var app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.js',
  excludeDefaultStyles: true,
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  decorateCanvas: false
} ),

config = require( '../../testconfig.js' ),

service = require( '../../service' ),

mw = service.mw,

utils = require( 'utils' ),

agendaTestService = require( './agendaTestService' );

app.get( '/', mw.list );

service.init( utils.extend( {
  services: {
    agendas: agendaTestService
  }
}, config ) );

service.rebuild( () => app.getAndListen() );