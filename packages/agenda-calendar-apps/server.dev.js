"use strict";

const _ = require( 'lodash' );
const express = require( 'express' );
const fs = require( 'fs' );
const webpack = require( 'webpack' );

const webpackConfig = require( './webpack.dev' );
const compiler = webpack( webpackConfig );
const service = require( './server' );

const dev = express();

service.init( _.extend( require( './config.dev' ), {
  frontAppPath: 'js'
} ) );

dev.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true, 
  publicPath: '/js'
} ) );

dev.use( require( 'webpack-hot-middleware' )( compiler ) );

dev.use( express.static( __dirname + '/../bs-templates/compiled' ) );

dev.get( '/', ( req, res, next ) => {

  res.redirect( 302, '/calendar' );

} );

dev.get( '/calendar', ( req, res, next ) => {

  req.agendaUid = 22604624;

  req.lang = 'fr';

  next();

} );

dev.use( '/calendar', service.app );

dev.listen( 3000 );