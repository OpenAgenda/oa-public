"use strict";

const feathers = require( '@feathersjs/feathers' );
const express = require( '@feathersjs/express' );
const log = require( '@openagenda/logs' )( 'users' );
const Service = require( './Service' );
const hooks = require( './hooks' );
const config = require( './config' );

const app = express( feathers() );

app
  .use( express.original.urlencoded( { extended: true } ) )
  .use( express.original.json() )
  .configure( express.rest() );

let serviceInstance = null;
let service = null;

function exposeApp( parentApp, path ) {
  log( 'expose app' );

  parentApp.use( app );

  app.use( path, serviceInstance );

  service = app.service( path );

  service.hooks( hooks );

  return app;
}

module.exports = Object.assign( () => service, {
  app,
  exposeApp
} );

module.exports.init = c => {
  config.init( c );

  serviceInstance = new Service( {
    Model: config.knex,
    name: config.name,
    id: 'uid',
    paginate: config.paginate
  } );

  service = feathers()
    .use( config.name, serviceInstance )
    .service( config.name );

  service.hooks( hooks );
};
