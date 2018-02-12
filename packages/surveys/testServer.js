"use strict";

const parentApp = require( 'express' )();

const service = require( './server' );

const config = require( './testconfig' );

config.knex.raw( 'use ' + config.test.connection.database ).then( () => {

  service.init( config );
  
})


const app = require( './server' ).app;

parentApp.use( ( req, res, next ) => {

  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();

} );

parentApp.use( '/survey', app );

parentApp.listen( 3000 );

parentApp.get( '/redirect', ( req, res, next ) => {

  res.send( 'redirected!' );

} );