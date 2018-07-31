'use strict';

const path = require( 'path' );
const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const feathers = require( '@feathersjs/feathers' );
const express = require( '@feathersjs/express' );
const log = require( '@openagenda/logs' )( 'users' );
const Service = require( './Service' );
const config = require( './config' );
const tokens = require( './tokens' );
const tokensHooks = require( './tokens/hooks' );

const methods = [
  'hooks',
  'on',
  'once',
  'emit',

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
  'verifyPassword',
  'activate'
];

let usersSvc = null;
let tokensSvc = null;

const app = express( feathers() );

app
  .use( express.urlencoded( { extended: true, limit: '10mb' } ) )
  .use( express.json( { limit: '10mb' } ) )
  .configure( express.rest( null ) );

let usersSvcInstance = null;

function exposeApp( parentApp, mountpath ) {
  const mw = require( './middleware' );

  log( 'expose app' );

  // basic methods (find, get, create, update, patch, remove)
  app
    .use( mountpath, usersSvcInstance )
    .use( `${mountpath}/tokens`, tokens() );

  usersSvcInstance.setup( app, mountpath );

  // custom methods
  app.use(
    path.join( mountpath, '/:__feathersId/setImageProfile' ),
    mw.setImageProfile(),
  );

  app.use(
    path.join( mountpath, '/:__feathersId/clearImageProfile' ),
    mw.clearImageProfile(),
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
    express.errorHandler( { html: false } ),
  );

  parentApp
    .use( app )
    .use( mountpath, express.rest.formatter );

  // callable service, exposed with express provider
  usersSvc = app.service( mountpath );
  tokensSvc = app.service( `${mountpath}/tokens` );

  tokensSvc.hooks( tokensHooks );

  return app;
}

module.exports = Object.assign(
  () => usersSvc,
  // users.<method>
  methods.reduce( ( result, method ) => ({
    ...result,
    [ method ]: ( ...args ) => {
      if ( !usersSvc ) {
        throw new Error( 'Service is not initialized' );
      }

      return usersSvc[ method ].apply( usersSvc, args );
    }
  }), {} ),
  {
    // users.tokens.<method>
    tokens: [ 'create', 'get', 'remove', 'findOne' ].reduce( ( result, method ) => ({
      ...result,
      [ method ]: ( ...args ) => {
        if ( !tokensSvc ) {
          throw new Error( 'Service is not initialized' );
        }

        return tokensSvc[ method ].apply( tokensSvc, args );
      }
    }), {} ),
    app,
    exposeApp,
    Service,
    config
  } );

module.exports.init = c => {
  config.init( c );

  tokens.init();

  // raw service instance
  usersSvcInstance = new Service( {
    Model: knexLib( {
      client: 'mysql',
      connection: config.mysql,
      schemas: config.schemas
    } ),
    name: config.schemas.user,
    id: 'uid',
    paginate: config.paginate
  } );

  // callable service, not exposed
  const tempPath = config.schemas.user;
  const tempApp = feathers()
    .use( tempPath, usersSvcInstance )
    .use( `${tempPath}/tokens`, tokens() );

  usersSvcInstance.setup( tempApp, tempPath );

  usersSvc = tempApp.service( config.schemas.user );
  tokensSvc = tempApp.service( `${config.schemas.user}/tokens` );

  tokensSvc.hooks( tokensHooks );
};
