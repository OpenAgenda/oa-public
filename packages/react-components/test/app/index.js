"use strict";

var app = require( '@openagenda/test-app' )( {
  frontWrapper: __dirname + '/front.jsx',
  styles: [
    __dirname + '/../../../bs-templates/compiled/main.css'
  ],
  webpack: true
} );

app.getAndListen();