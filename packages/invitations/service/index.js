"use strict";

const knexLib = require( 'knex' )
const logs = require( '@openagenda/logs' );
const { promisePlusCb } = require( '@openagenda/service-utils' );
const uuid = require( 'uuid' );
const validators = require( '@openagenda/validators' );
const _ = require( 'lodash' );
const defineUnique = require( '@openagenda/mysql-utils/defineUnique' );
const Invitation = require( './Invitation' );

let config;
let knex;

const columns = [ 'id', 'email', 'token', 'store' ];


module.exports = {
  init,
  get,
  assign,
  removeAction,
  remove,
  execute,
  Invitation
};


function init( c, cb ) {

  config = c;

  if ( c.logger ) {
    logs.setModuleConfig( c.logger );
  }

  knex = knexLib( {
    client: 'mysql',
    connection: { ...c.mysql },
  } );

  Invitation.init( c, module.exports, knex );

  if ( cb ) cb();

}

function parseGetArguments( query, options, cb ) {

  const result = {
    query,
    options,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 2 ) {

    Object.assign( result, {
      query: args[ 0 ],
      options: {},
      cb: args[ 1 ]
    } );

  }

  return result;

}


function get() {

  if ( !config ) {
    return promisePlusCb( Promise.reject( 'service not initialized' ), arguments );
  }

  const {
    query,
    options,
    cb
  } = parseGetArguments.apply( null, arguments );

  const promise = Promise.resolve( {
    query: _.pick( query, [ 'email', 'token' ] ),
    options,
    result: {
      invitation: null,
      success: null,
      errors: []
    }
  } )
    .then( _get( 'result.invitation', options.includeProcessed ) )
    .then( _instanciate( 'result.invitation' ) )
    .then( _notFound( 'result.invitation', 'result.errors' ) )
    .then( v => Object.assign( v.result, {
      success: !v.result.errors.length && !!v.result.invitation
    } ) );

  return promisePlusCb( promise, cb );

}


function assign( query, actionName, params, cb ) {

  if ( !config ) {
    return promisePlusCb( Promise.reject( 'service not initialized' ), arguments );
  }

  const args = Array.from( arguments );

  // Add callback when not specified
  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 3 ) {
    args[ 3 ] = args[ 2 ]; // cb = params
    args[ 2 ] = []; // params = []
    cb = params;
    params = [];
  }

  const promise = Promise.resolve( {
    query: _.pick( query, [ 'email', 'token' ] ),
    actionName,
    params,
    result: {
      invitation: null,
      success: null,
      errors: [],
    }
  } )
    .then( _get( 'result.invitation' ) )
    .then( _actionExists( 'actionName' ) )
    .then( _create( 'result.invitation', v => (!v.result.invitation && !v.result.errors.length ) ) )
    .then( _get( 'result.invitation' ) )
    .then( _notFound( 'result.invitation', 'result.errors' ) )
    .then( _instanciate( 'result.invitation' ) )
    .then( _addAction( 'result.invitation', 'actionName', 'params', v => (v.result.invitation && !v.result.errors.length ) ) )
    .then( v => Object.assign( v.result, {
      success: !v.result.errors.length && !!v.result.invitation
    } ) );

  return promisePlusCb( promise, args );

}


function removeAction( query, actionId, cb ) {

  if ( !config ) {
    return promisePlusCb( Promise.reject( 'service not initialized' ), arguments );
  }

  const promise = Promise.resolve( {
    query: _.pick( query, [ 'email', 'token' ] ),
    actionId,
    result: {
      invitation: null,
      success: null,
      errors: [],
    }
  } )
    .then( _get( 'result.invitation' ) )
    .then( _notFound( 'result.invitation', 'result.errors' ) )
    .then( _instanciate( 'result.invitation' ) )
    .then( _removeAction( 'result.invitation', 'actionId', v => (v.result.invitation && !v.result.errors.length ) ) )
    .then( v => Object.assign( v.result, {
      success: !v.result.errors.length && !!v.result.invitation
    } ) );

  return promisePlusCb( promise, arguments );

}


function remove( query, cb ) {

  if ( !config ) {
    return promisePlusCb( Promise.reject( 'service not initialized' ), arguments );
  }

  const promise = Promise.resolve( {
    query: _.pick( query, [ 'email', 'token' ] ),
    invitation: null,
    result: {
      success: null,
      errors: [],
    }
  } )
    .then( _get( 'invitation' ) )
    .then( _notFound( 'invitation', 'result.errors' ) )
    .then( _instanciate( 'invitation' ) )
    .then( _remove( 'invitation', v => (v.invitation && !v.result.errors.length ) ) )
    .then( v => Object.assign( v.result, {
      success: !v.result.errors.length
    } ) );

  return promisePlusCb( promise, arguments );

}

function execute( query, data, cb ) {

  if ( !config ) {
    return promisePlusCb( Promise.reject( 'service not initialized' ), arguments );
  }

  const args = Array.from( arguments );

  // Add callback when not specified
  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 2 ) {
    args[ 2 ] = args[ 1 ]; // cb = params
    args[ 1 ] = []; // params = []
    cb = data;
    data = null;
  }

  const promise = Promise.resolve( {
    query: _.pick( query, [ 'email', 'token' ] ),
    data,
    invitation: null,
    result: {
      success: null,
      results: [],
      errors: [],
    }
  } )
    .then( _get( 'invitation' ) )
    .then( _notFound( 'invitation', 'result.errors' ) )
    .then( _instanciate( 'invitation' ) )
    .then( _execute( 'invitation', 'result', 'data', v => (v.invitation && !v.result.errors.length ) ) )
    .then( v => Object.assign( v.result, {
      success: !v.result.errors.length
    } ) );

  return promisePlusCb( promise, args );

}


/**************/

function _create( toPath, prerequisite = () => true ) {

  return v => {

    if ( !prerequisite( v ) ) return v;

    const validateEmail = validators.email( { field: 'userEmail' } );

    try {

      validateEmail( v.query.email );

    } catch ( e ) {

      v.result.errors.concat( e );
      return v;

    }

    return new Promise( ( resolve, reject ) => {

      defineUnique( {
        table: config.schemas.invitation,
        field: 'token',
        mysql: config.mysql
      }, () => uuid(), ( err, token ) => {

        if ( err ) reject( err );

        return resolve( knex( config.schemas.invitation ).insert( {
          email: v.query.email,
          token
        } )
          .then( result => {

            _.set( v, toPath, result[ 0 ] );

            return v;

          } ) );

      } );

    } );

  };

}

function _get( toPath, includeProcessed = false ) {

  return v => {

    const { email, token } = v.query;
    const where = _.pickBy( { email, token }, v => !!v );

    if ( !_.keys( where ).length ) return Promise.reject( 'identifier not found' );

    if ( !includeProcessed ) where.processedAt = null;

    return knex( config.schemas.invitation ).select(columns)
      .where( where )
      .then( result => {

        if ( result.length ) {
          _.set( v, toPath, { ...result[0] } || null );
        } else {
          _.set( v, toPath, null);
        }

        return v;

      } );

  };

}

function _instanciate( fromPath, toPath ) {

  return v => {

    if ( !toPath ) toPath = fromPath;

    const invitation = _.get( v, fromPath );

    if ( invitation ) {
      _.set( v, toPath, new Invitation( invitation ) );
    }

    return v;

  }

}

function _actionExists( namePath ) {

  return v => {

    if ( v.result.errors.length ) return v;

    const name = _.get( v, namePath );

    if ( !_.get( config.actions, name ) ) {

      v.result.errors.push( {
        code: 'action.notFound',
        message: 'action not found in config',
        origin: name
      } );

      return v;

    }

    return v;

  }

}

function _addAction( invitationPath, namePath, paramsPath, prerequisite = () => true ) {

  return v => {

    if ( !prerequisite( v ) ) return v;

    return _.get( v, invitationPath ).addAction( _.get( v, namePath ), _.get( v, paramsPath ) )
      .then( ( { errors } ) => {

        if ( errors && errors.length ) v.result.errors.concat( errors );

        return v;

      } );

  };

}

function _removeAction( invitationPath, idPath, prerequisite = () => true ) {

  return v => {

    if ( !prerequisite( v ) ) return v;

    return _.get( v, invitationPath ).removeAction( _.get( v, idPath ) )
      .then( ( { errors } ) => {

        if ( errors && errors.length ) v.result.errors.concat( errors );

        return v;

      } );

  };

}

function _remove( invitationPath, prerequisite = () => true ) {

  return v => {

    if ( !prerequisite( v ) ) return v;

    return _.get( v, invitationPath ).remove()
      .then( () => v );

  };

}

function _execute( invitationPath, resultsPath, dataPath, prerequisite = () => true ) {

  return v => {

    if ( !prerequisite( v ) ) return v;

    return _.get( v, invitationPath ).execute( _.get( v, dataPath ) )
      .then( results => {

        _.set( v, resultsPath, results );

        return v;

      } );

  };

}

function _notFound( invitationPath, errorsPath ) {

  return v => {

    if ( !_.get( v, invitationPath ) ) {
      _.get( v, errorsPath ).push( {
        code: 'invitation.notFound',
        message: 'invitation cannot be found'
      } );
    }

    return v;

  }

}
