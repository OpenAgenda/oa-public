"use strict";

const webpack = require( 'webpack' );
const webpackConfig = require( './webpack.config' );
const compiler = webpack( webpackConfig );

const express = require( 'express' );

const parentApp = express();

const config = require( './testconfig' );
const service = require( './server' );

parentApp.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true, 
  publicPath: webpackConfig.output.publicPath
} ) );

config.knex.raw( 'use ' + config.test.connection.database ).then( () => {

  service.init( config );
  
} );

parentApp.use( require( 'webpack-hot-middleware' )( compiler ) );

parentApp.use( express.static( __dirname + '/node_modules/@openagenda/bs-templates/compiled' ) );

parentApp.use( ( req, res, next ) => {

  req.lang = 'fr';

  next();

} );

parentApp.post( '/agendas/:agendaUid/survey', ( req, res, next ) => {

  // if data must be decorated, it can be done here
  
  req.decorateWith = {
    uid: req.params.agendaUid,
    contributor: 'steve'
  }

  next();

} );

parentApp.get( '/', ( req, res ) => res.redirect( 302, '/agendas/123/survey' ) );

parentApp.get( '/redirect', ( req, res, next ) => {
  
  res.send( 'redirected!' );
  
} );


/**
 * service app bit
 */

const app = require( './server' ).app;

parentApp.use( '/agendas/:agendaUid/survey', app );

parentApp.listen( 8080 );