"use strict";

const webpack = require( 'webpack' );
const webpackConfig = require( './webpack.dev' );
const compiler = webpack( webpackConfig );

const express = require( 'express' );

const devApp = express();

const config = require( './config.dev' );
const service = require( './server' );

devApp.use( require( 'webpack-dev-middleware' )( compiler, {
  noInfo: true, 
  publicPath: webpackConfig.output.publicPath
} ) );

devApp.use( require( 'webpack-hot-middleware' )( compiler ) );

config.knex.raw( 'use ' + config.test.connection.database ).then( () => {

  // in dev environment, hot reload puts js there:
  config.frontAppPath = '/js/index.js';

  service.init( config );
  
} );

devApp.use( express.static( __dirname + '/../../node_modules/@openagenda/bs-templates/compiled' ) );

devApp.use( ( req, res, next ) => {

  req.lang = 'fr';

  next();

} );

devApp.post( '/agendas/:agendaUid/survey', ( req, res, next ) => {

  // if data must be decorated, it can be done here
  
  req.decorateWith = {
    uid: { $set: req.params.agendaUid },
    contributor: { $set: 'steve' }
  }

  next();

} );

devApp.get( '/', ( req, res ) => res.redirect( 302, '/agendas/123/survey' ) );

devApp.get( '/redirect', ( req, res ) => {
  
  res.send( 'redirected!' );
  
} );


/**
 * service app bit
 */

devApp.use( '/agendas/:agendaUid/survey', service.app );

// in production only
devApp.use( '/dist/surveys', service.dist );

devApp.listen( 3000 );
