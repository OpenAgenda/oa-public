"use strict";

var app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  styles: [
    __dirname + '/../../sass/main.scss'
  ]
} );

app.getAndListen();