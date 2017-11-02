"use strict";

const verror = require( 'verror' );
const _ = require( 'lodash' );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );
const schema = require( '@openagenda/validators/schema' );
const log = require( '@openagenda/basic-logger' )( 'users/list' );
const config = require( '../config' );

module.exports = list;

schema.register( {
  text: require( '@openagenda/validators/text' ),
  number: require( '@openagenda/validators/number' ),
  boolean: require( '@openagenda/validators/boolean' ),
  integer: require( '@openagenda/validators/integer' ),
  pass: require( '@openagenda/validators/pass' ),
} );

function validate( args ) {

  const validate = schema( {
    query: {
      search: {
        type: 'text',
        default: null
      },
      uid: {
        type: 'integer',
        list: {
          default: null
        }
      },
      id: {
        type: 'integer',
        list: {
          default: null
        }
      }
    },
    offset: {
      type: 'number',
      default: 0
    },
    limit: {
      type: 'number',
      default: 20
    },
    options: {
      total: {
        type: 'boolean',
        default: false
      },
      detailed: {
        type: 'boolean',
        default: false
      },
      removed: {
        type: 'boolean',
        default: false
      }
    },
    cb: {
      type: 'pass'
    }
  } );

  return validate( args );

}

const basicFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'is_new', 'created_at', 'updated_at' ];
const detailedFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'is_new',
  'facebook_uid', 'twitter_id', 'google_id', 'culture', 'is_activated', 'created_at',
  'updated_at', 'last_notified', 'is_removed', 'last_signin', 'comexposium_id' ];

async function list( query, offset, limit, options, cb ) {

  const { knex } = config;

  let result;
  let error;

  try {

    const args = parseListArguments.apply( null, arguments );

    /***************/
    /* DEPRECATION */

    if ( args.query && args.query.detailed ) {
      log( 'warning', 'DEPRECATED - detailed in query is deprecated, use options instead' );
      args.options.detailed = args.query.detailed;
      args.query.detailed = undefined;
    }

    if ( args.query && args.query.total ) {
      log( 'warning', 'DEPRECATED - total in query is deprecated, use options instead' );
      args.options.total = args.query.total;
      args.query.total = undefined;
    }

    if ( args.query && args.query.removed ) {
      log( 'warning', 'DEPRECATED - removed in option is deprecated, use options instead' );
      args.options.removed = args.query.removed;
      args.query.removed = undefined;
    }

    /***************/

    try {
      ({ query, offset, limit, options, cb } = validate( args ));
    } catch ( e ) {
      throw new VError( {
        name: 'ValidationError',
        info: {
          errors: e
        }
      }, 'Validation failed' );
    }

    const baseRequest = knex( config.schemas.user );

    if ( query.search ) {
      baseRequest.where( function () {
        this.where( 'full_name', 'like', `%${query.search}%` )
          .orWhere( 'email', 'like', `%${query.search}%` );
      } );
    }

    if ( query.uid ) {
      baseRequest.whereIn( 'uid', query.uid );
    }

    if ( query.id ) {

      baseRequest.whereIn( 'id', query.id );

    }

    if ( options.removed === false ) {
      baseRequest.where( 'is_removed', 0 );
    } else if ( options.removed === true ) {
      baseRequest.where( 'is_removed', 1 );
    }

    let total = null;

    if ( options && options.total ) {
      total = (await baseRequest.clone().count( '* as total' ))[ 0 ].total;
    }

    const users = await baseRequest
      .select( options.detailed ? detailedFields : basicFields.concat( options.removed ? 'is_removed' : [] ) )
      .orderBy( 'email', 'asc' )
      .limit( limit )
      .offset( offset )
      .map( parse );

    result = { users, total };

  } catch ( e ) {

    error = e;

  }

  // cb
  if ( typeof cb === 'function' ) {
    return error ? cb( error ) : cb( null, result.users, result.total );
  }

  // promise
  if ( error ) throw error;
  return result;

}

function parse( row ) {

  if ( !row ) return row;

  return _.mapKeys( row, ( v, k ) => _.camelCase( k ) );

}
