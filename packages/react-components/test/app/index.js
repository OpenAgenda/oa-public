"use strict";

var app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  styles: [
    __dirname + '/../../node_modules/@openagenda/bs-templates/compiled/main.css'
  ],
  webpack: true
} );

app.getAndListen();