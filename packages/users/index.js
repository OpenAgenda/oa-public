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

  // basic methods (find, get, create, update, patch, remove)
  app.use( mountpath, serviceInstance );

  // custom methods
  app.use(
    path.join( mountpath, '/:uid/setImageProfile' ),
    mw.setImageProfile()
  );

  app.use(
    path.join( mountpath, '/:uid/clearImageProfile' ),
    mw.clearImageProfile()
  );

  app.use(
    path.join( mountpath, '/:uid/requestChangeEmail' ),
    mw.requestChangeEmail(),
  );

  app.use(
    path.join( mountpath, '/:uid/confirmChangeEmail' ),
    mw.confirmChangeEmail(),
  );

  app.use(
    path.join( mountpath, '/:uid/changePassword' ),
    mw.changePassword(),
  );

  app.use(
    path.join( mountpath, '/:uid/generateApiKey' ),
    mw.generateApiKey(),
  );

  app.use(
    path.join( mountpath, '/:uid/setNewFlag' ),
    mw.setNewFlag(),
  );

  app.use(
    path.join( mountpath, '/:uid/refresh' ),
    mw.refresh(),
  );

  app.use( express.errorHandler() );

  service = app.service( mountpath );

  service.hooks( hooks );

  parentApp
    .use( app )
    .use( express.rest.formatter );

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
