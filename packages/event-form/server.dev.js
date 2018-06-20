"use strict";

const express = require( 'express' );
const webpack = require( 'webpack' );

const webpackConfig = require( './webpack.dev' );
const compiler = webpack( webpackConfig );

const style = require( '@openagenda/bs-templates' ).getCss( 'main' );

const service = require( './' );

service.init( {
  layout
} );

const dev = express();

dev.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true, 
  publicPath: '/js'
} ) );

dev.use( require( 'webpack-hot-middleware' )( compiler ) );

dev.get( '/', ( req, res ) => res.redirect( 302, '/app' ) );

dev.use( '/app', service.app );

dev.get( '/style.css', ( req, res ) => res.set( 'Content-Type', 'text/css' ).send( style ) );

dev.listen( 3000 );


const layoutStr = `<!DOCTYPE html>
  <html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body><!--content--></body>
</html>`;

function layout( req, content ) {

  return layoutStr.replace( '<!--content-->', content );

}