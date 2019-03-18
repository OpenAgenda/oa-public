'use strict';

const debug = require( 'debug' );
const VError = require( 'verror' );
const errors = require( '@feathersjs/errors' );
const { disallow } = require( 'feathers-hooks-common' );
const {
  callInterface,
  camelCase,
  camelCaseQuery,
  snakeCase,
  snakeCaseQuery,
  generateToken
} = require( '../hooks/index' );


module.exports = {
  before: {
    all: disallow( 'external' ),
    find: [
      context => {
        const query = context.params.query || {};

        switch ( query.type ) {
          case 'activateAccount':
            query.type = 'aa';
            break;
          case 'lostPassword':
            query.type = 'lp';
            break;
          default:
            break;
        }

        context.params.query = query;
      },
      snakeCase(),
      snakeCaseQuery()
    ],
    get: [
      snakeCase(),
      snakeCaseQuery()
    ],
    create: [
      generateToken( 'data.token' ),
      context => {
        switch ( context.data.type ) {
          case 'activateAccount':
            context.data.type = 'aa';
            break;
          case 'lostPassword':
            context.data.type = 'lp';
            break;
          default:
            break;
        }
      },
      snakeCase(),
      snakeCaseQuery()
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      camelCase(),
      camelCaseQuery(),
    ],
    find: [],
    get: [
      async context => {
        if ( !context.result && context.params.createIfNotExist ) {
          context.result = await this.create( _.pick( params.query, 'email', 'type', 'userId' ) );
        }
      }
    ],
    create: [
      callInterface( 'sendToken' )
    ],
    update: [],
    patch: [],
    remove: []
  },

  error( context ) {
    // Avoid soft delete error
    if ( context.error instanceof errors.NotFound && context.error.message.includes( 'Item not found' ) ) {
      context.error = null;
      context.result = null;
      return context;
    }

    if ( !(context.error instanceof errors.NotFound) ) {
      log.error(
        `Error in '${context.path}' service method '${context.method}'\n${VError.fullStack( context.error )}\n`,
        inspect( _.omit( context.error, [ 'hook.app', 'hook.service' ] ), {
          colors: debug.useColors()
        } )
      );
    }
  },
};
