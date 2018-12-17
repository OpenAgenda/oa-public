"use strict";

const express = require( 'express' );
const webpack = require( 'webpack' );

const webpackConfig = require( './webpack' );
const compiler = webpack( webpackConfig );

const dev = express();

const locationApp = require( './locationApp' );
const referencesApp = require( './referencesApp' );

const style = require( '@openagenda/bs-templates' ).getCss( 'main' );

dev.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true,
  publicPath: '/js'
} ) );

dev.use( require( 'webpack-hot-middleware' )( compiler ) );

dev.get( '/', ( req, res ) => {

  res.send( `
    <!DOCTYPE html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <html>
      <body>
        <div id="app"></div>
        <script src="js/app.js"></script>
      </body>
    </html>`
  );

} );

dev.use( '/locations', locationApp );

dev.use( '/references', referencesApp );

dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );

dev.use( '/fonts', express.static( __dirname + '/../../bs-templates/templates/fonts' ) );

dev.listen( 3000 );
