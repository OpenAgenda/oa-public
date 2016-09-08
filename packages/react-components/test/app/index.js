"use strict";

var app = require( 'test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  styles: [
    __dirname + '/../../node_modules/bs-templates/compiled/main.css'
  ],
  webpack: true
} );

app.getAndListen();