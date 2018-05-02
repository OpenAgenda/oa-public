"use strict";

const path = require( 'path' );
const feathers = require( '@feathersjs/feathers' );
const express = require( '@feathersjs/express' );
const log = require( '@openagenda/logs' )( 'users' );
const knexLib = require( 'knex' );
const Service = require( './Service' );
const hooks = require( './hooks' );
const config = require( './config' );

const app = express( feathers() );

app
  .use( express.original.urlencoded( { extended: true, limit: '10mb' } ) )
  .use( express.original.json( { limit: '10mb' } ) )
  .configure( express.rest() );

let serviceInstance = null;
let service = null;

function exposeApp( parentApp, mountpath ) {
  const mw = require( './middleware' );

  log( 'expose app' );

  app.use( mountpath, serviceInstance );

  app.use(
    path.join( mountpath, '/setImageProfile' ),
    mw.setImageProfile()
  );

  app.use(
    path.join( mountpath, '/clearImageProfile' ),
    mw.clearImageProfile(),
    ( req, res ) => {
      res.send( { success: true } );
    }
  );

  app.use( express.errorHandler() );

  service = app.service( mountpath );

  service.hooks( hooks );

  parentApp.use( app );

  return app;
}

module.exports = Object.assign( () => service, {
  app,
  exposeApp,
  Service
} );

module.exports.init = c => {
  config.init( c );

  serviceInstance = new Service( {
    Model: knexLib( {
      client: 'mysql',
      connection: config.mysql,
      schemas: c.schemas
    } ),
    name: config.name,
    id: 'uid',
    paginate: config.paginate
  } );

  service = feathers()
    .use( config.name, serviceInstance )
    .service( config.name );

  service.hooks( hooks );
};
