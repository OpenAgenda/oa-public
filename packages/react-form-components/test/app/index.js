"use strict";

var app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  excludeDefaultStyles: true,
  webpack: true,
  styles: [
    __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ]
} ),

express = require( 'express' );

app.use( '/js', express.static( __dirname + '/js' ) );

app.getAndListen();