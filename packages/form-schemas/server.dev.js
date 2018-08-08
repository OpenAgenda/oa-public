"use strict";

const express = require( 'express' );
const webpack = require( 'webpack' );

const bodyParser = require( 'body-parser' );

const webpackConfig = require( './webpack.dev' );
const compiler = webpack( webpackConfig );

const dev = express();

const style = require( '@openagenda/bs-templates' ).getCss( 'main' );

dev.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true, 
  publicPath: '/js'
} ) );

dev.use( require( 'webpack-hot-middleware' )( compiler ) );

dev.get( '/', ( req, res ) => res.send( render( 'index' ) ) )

dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );

dev.use( '/fonts', express.static( __dirname + '/../bs-templates/templates/fonts' ) );

dev.get( '/:page', ( req, res ) => res.send( render( req.params.page ) ) );

dev.post( '/:page', bodyParser.json(), ( req, res ) => {

  res.json( {
    message: 'ok, ' + req.params.page
  } );

} );

dev.listen( 3000 );

function render( filename ) {

  return `<!DOCTYPE html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <html>
      <body>
        <div id="app"></div>
        <script src="js/${filename}.js"></script>
      </body>
    </html>`;

}