"use strict";

const path = require( 'path' );
const feathers = require( '@feathersjs/feathers' );
const express = require( '@feathersjs/express' );
const log = require( '@openagenda/logs' )( 'users' );
const knexLib = require( 'knex' );
const Service = require( './Service' );
const config = require( './config' );

const methods = [
  'hooks',
  'on',
  'once',
  'emit',
  'events',

  'find',
  'get',
  'create',
  'update',
  'patch',
  'remove',
  'findOne',
  'setImageProfile',
  'clearImageProfile',
  'requestChangeEmail',
  'confirmChangeEmail',
  'changePassword',
  'generateApiKey',
  'setNewFlag',
  'refresh',
  'verifyPassword'
];

const app = express( feathers() );

app
  .use( express.urlencoded( { extended: true, limit: '10mb' } ) )
  .use( express.json( { limit: '10mb' } ) )
  .configure( express.rest( null ) );

let serviceInstance = null;
let service = null;

function exposeApp( parentApp, mountpath ) {
  const mw = require( './middleware' );

  log( 'expose app' );

  // basic methods (find, get, create, update, patch, remove)
  app.use( mountpath, serviceInstance );

  // custom methods
  app.use(
    path.join( mountpath, '/:__feathersId/setImageProfile' ),
    mw.setImageProfile()
  );

  app.use(
    path.join( mountpath, '/:__feathersId/clearImageProfile' ),
    mw.clearImageProfile()
  );

  app.use(
    path.join( mountpath, '/:__feathersId/requestChangeEmail' ),
    mw.requestChangeEmail(),
  );

  app.use(
    path.join( mountpath, '/:__feathersId/confirmChangeEmail' ),
    mw.confirmChangeEmail(),
  );

  app.use(
    path.join( mountpath, '/:__feathersId/changePassword' ),
    mw.changePassword(),
  );

  app.use(
    path.join( mountpath, '/:__feathersId/generateApiKey' ),
    mw.generateApiKey(),
  );

  app.use(
    path.join( mountpath, '/:__feathersId/setNewFlag' ),
    mw.setNewFlag(),
  );

  app.use(
    path.join( mountpath, '/:__feathersId/refresh' ),
    mw.refresh(),
  );

  app.use(
    mountpath,
    express.errorHandler( { html: false } )
  );

  parentApp
    .use( app )
    .use( mountpath, express.rest.formatter );

  // callable service, exposed with express provider
  service = app.service( mountpath );

  return app;
}

module.exports = Object.assign(
  () => service,
  methods.reduce( ( result, method ) => ({
    ...result,
    [ method ]: ( ...args ) => {
      if ( !service ) {
        throw new Error( 'Service is not initialized' );
      }

      return service[ method ].apply( service, args );
    }
  }), {} ),
  {
    app,
    exposeApp,
    Service
  } );

module.exports.init = c => {
  config.init( c );

  // raw service instance
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

  // callable service, not exposed
  service = feathers()
    .use( config.name, serviceInstance )
    .service( config.name );
};
