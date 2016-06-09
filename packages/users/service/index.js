"use strict";

const knexLib = require( 'knex' ),

  w = require( 'when' ),

  logger = require( 'basic-logger' ),

  mailer = require( 'mailer' ),

  validators = require( './validators' ),

  utils = require( 'utils' ),

  crypto = require( './crypto' ),

  mw = require( '../middleware' );


var config, knex, schemas;


module.exports = {
  init,
  mw,
  validators,
  list,
  get,
  set,
  updateProfile,
  changePassword,
  verifyPassword,
  requestChangeEmail,
  confirmChangeEmail,
  remove
};


function init( c, cb ) {

  schemas = c.schemas;

  config = Object.assign( {
    interfaces: {
      // signal user deletion
      userWillRemove: ( user, cb ) => {
        if ( cb ) cb( null )
      }
    }
  }, c );

  w( c )

    .then( () => {

      if ( c.logger ) {

        logger.setLogger( c.logger );

      }

    } )

    .then( () => {

      knex = knexLib( {
        client: 'mysql',
        connection: c.mysql
      } );

    } )

    .then( () => {

      mw.init( require( './index' ), c );

    } )

    .done( () => cb ? cb() : null, cb ? cb : null );

}

function list( query, offset, limit, cb ) {

  if ( !config ) throw 'service not initialized';

  if ( arguments.length === 3 ) {

    cb = limit;
    limit = offset;
    offset = query;
    query = {};

  }

  query = Object.assign( {
    total: false,
    search: null
  }, query );

  w( {
    offset: offset,
    limit: limit,
    query: query,
    users: [],
    total: null,
    knex: knex( schemas.user )
  } )

    .then( _search )

    .then( _total )

    .then( _list )

    .done( v => cb( null, v.users, v.total ) );

}

function get( query, options, cb ) {

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  const params = Object.assign( {
    fullImagePath: false
  }, options );

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query ),
    user: null,
    params
  } )

    .then( _get )

    .then( _clean )

    .then( _formatImageUrl )

    .done( v => cb( null, v.user ), err => cb( err ) );

}

function set( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query, true ),
    query: query,
    user: null,
    valid: false,
    success: false,
    errors: []
  } )

    .then( _checkEmailTaken )

    .then( _hashPassword )

    .then( _updateOrInsert )

    .done( v => cb( null, {
      user: v.user,
      valid: v.valid,
      success: v.success,
      errors: v.errors
    } ), err => cb( err ) );

}

function updateProfile( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  // full_name & culture

  w( {
    identifier: getIdentifier( query ),
    query: query,
    user: null,
    valid: false,
    success: false,
    errors: []
  } )

    .then( _checkEmailTaken )

    .then( _filterForUpdateProfile )

    .then( _updateOrInsert )

    .then( _clean )

    .done( v => cb( null, {
      user: v.user,
      valid: v.valid,
      success: v.success,
      errors: v.errors
    } ), err => cb( err ) );

}

function changePassword( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query ),
    query: query,
    valid: false,
    success: false,
    errors: []
  } )

    .then( _get )

    .then( _changePassword )

    .then( _hashPassword )

    .then( _updateOrInsert )

    .done( v => cb( null, {
      valid: v.valid,
      success: v.success,
      errors: v.errors
    } ), err => cb( err ) );

}

function verifyPassword( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query ),
    query: query,
    success: false
  } )

    .then( _get )

    .then( _verifyPassword )

    .done( v => cb( null, v.success ), err => cb( err ) );

}

function requestChangeEmail( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query, true ),
    query: query,
    valid: false,
    success: false,
    errors: [],
    token: null
  } )

    .then( _get )

    .then( _checkEmailTaken )

    .then( _requestChangeEmail )

    .then( _updateOrInsert )

    .done( v => cb( null, {
      valid: v.valid,
      success: v.success,
      errors: v.errors,
      token: v.token
    } ), err => cb( err ) );

}

function confirmChangeEmail( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query, true ),
    query: query,
    errors: [],
    emailChanged: false
  } )

    .then( _get )

    .then( _checkEmailTaken )

    .then( _confirmChangeEmail )

    .then( _updateOrInsert )

    .done( v => cb( null, v.emailChanged ), err => cb( err ) );

}

function remove( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query, true ),
    query: query,
    errors: [],
    success: false
  } )

    .then( _get )

    .then( _removeUser )

    .then( _updateOrInsert )

    .done( v => cb( null, v.success ), err => cb( err ) );

}


function _search( v ) {

  if ( !v.query.search ) return v;

  v.knex.where( 'full_name', 'like', `%${v.query.search}%` )
    .orWhere( 'email', 'like', `%${v.query.search}%` );

  return v;

}

function _total( v ) {

  if ( !v.query.total ) return v;

  return knex.transaction( trx => {

    return v.knex.clone()
      .count( 'id as users' )
      .transacting( trx );

  } )

    .then( result => {

      v.total = result[ 0 ].users;

      return v;

    } );

}

function _list( v ) {

  return knex.transaction( trx => {

    return v.knex
      .select( 'id', 'uid', 'full_name', 'username', 'email', 'image', 'facebook_uid', 'twitter_id', 'google_id', 'culture',
        'is_activated', 'created_at', 'updated_at', 'last_notified', 'is_removed', 'last_signin', 'comexposium_id' )
      .orderBy( 'email', 'asc' )
      .limit( v.limit )
      .offset( v.offset )
      .transacting( trx );

  } )

    .then( users => {

      v.users = users;

      return v;

    } );

}

function _get( v ) {

  var identifiers = Object.keys( v.identifier );

  return knex.transaction( trx => {

    return knex
      .select( schemas.user + '.*', schemas.apiKeySet + '.api_key', schemas.apiKeySet + '.api_secret' )
      .from( schemas.user )
      .leftJoin( schemas.apiKeySet, schemas.user + '.id', schemas.apiKeySet + '.user_id' )
      .where( schemas.user + '.' + ( identifiers[ 0 ] || 'id' ), v.identifier[ identifiers[ 0 ] ] || -1 )
      .limit( 1 )
      .transacting( trx );

  } )

    .then( users => {

      v.user = users.length && users[ 0 ].is_removed === 0 ? users[ 0 ] : null;

      return v;

    }, err => {

      throw err;

    } );

}

function _checkEmailTaken( v ) {

  if ( v.query.email ) {

    return emailAlreadyTaken( v.query.email )

      .then( emailTaken => {

        if ( emailTaken ) {

          v.errors.push( {
            field: 'email',
            code: 'email.alreadytaken',
            message: 'this email is not available',
            origin: v.query.email
          } );

        }

        return v;

      } );

  }

  return v;

}

function _updateOrInsert( v ) {

  if ( v.errors.length ) return v;

  var d = w.defer();


  get( v.query, ( err, user ) => {

    if ( err ) return d.reject( err );

    var mode = user && ( v.query.id || v.query.uid ) ? 'update' : 'insert',

      identifiers = Object.keys( v.identifier ),

      validator = mode == 'update' ? validators.update( v.query ) : validators( v.query ),

      fields = validator.fields;


    v.valid = validator.valid;

    if ( !user && ( v.query.id || v.query.uid ) ) {

      return d.resolve( v );

    }

    if ( !v.valid ) {

      v.errors = validator.errors;
      return d.resolve( v );

    }

    if ( mode == 'insert' ) fields.created_at = new Date();
    fields.updated_at = new Date();

    return knex.transaction( trx => {

      var queryBuilder = knex( schemas.user )[ mode ]( fields );

      if ( mode == 'update' ) {

        queryBuilder.where( identifiers[ 0 ] || 'id', v.identifier[ identifiers[ 0 ] ] || -1 )

      }

      return queryBuilder.transacting( trx );

    } )

      .then( result => {

        v.user = typeof result == 'number' ? Object.assign( user, fields ) : { id: result[ 0 ] };

        v.success = true;

        return d.resolve( v );

      }, err => {

        return d.reject( err );

      } );

  } );

  return d.promise;

}

function _filterForUpdateProfile( v ) {

  if ( v.errors.length ) {

    return v;

  }

  var identifiers = Object.keys( v.identifier ),

    validator = validators.updateProfile( v.query ),

    fields = validator.fields;


  v.valid = validator.valid;


  if ( !v.valid ) {

    v.errors = validator.errors;
    return v;

  }

  identifiers.forEach( elem => fields[ elem ] = v.query[ elem ] );

  v.query = fields;

  return v;

}

function _changePassword( v ) {

  if ( v.errors.length ) return v;

  var validator = validators.changePassword( v.query );


  v.valid = validator.valid;

  if ( !v.valid ) {

    v.errors = validator.errors;
    return v;

  }

  v.query.password = v.query.new_password;

  return v;

}

function _verifyPassword( v ) {

  v.success = crypto.verifyPassword( v.user.password, v.query.password, v.user.salt );

  return v;

}

function _hashPassword( v ) {

  if ( v.query.password ) {

    var salt = crypto.randomHash(),

      password = crypto.makeHashPassword( v.query.password, salt );


    v.query.password = password;

    v.query.salt = salt;

  }

  return v;

}

function _requestChangeEmail( v ) {

  if ( v.errors.length ) return v;

  var validator = validators.changeEmail( v.query );


  v.valid = validator.valid;

  if ( !v.valid ) {

    v.errors = validator.errors;
    return v;

  }


  var store = JSON.parse( v.user.store || {} ),

    token = crypto.randomHash();


  store.new_email = v.query.email;

  store.new_email_token = token;

  v.token = token;

  v.query.store = JSON.stringify( store );


  delete v.query.email;

  delete v.query.password;


  return v;

}

function _confirmChangeEmail( v ) {

  var store = JSON.parse( v.user.store || {} );

  if ( store.new_email_token == v.query.token ) {

    v.query.email = store.new_email;

    delete v.query.token;

    delete store.new_email;

    delete store.new_email_token;

    v.query.store = JSON.stringify( store );

    v.emailChanged = true;

  }

  return v;

}

function _removeUser( v ) {

  if ( !v.user ) {
    v.errors.push( {
      code: 'user.notfound',
      message: 'user not found',
    } );
    v.success = false;

    return v;
  }

  let d = w.defer();

  config.interfaces.userWillRemove( v.user, err => {

    if ( err ) return d.reject( err );

    v.user.is_removed = 1;
    v.user.is_activated = 0;

    var date = new Date();

    v.user.username = `*removed-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${v.user.id}`;

    v.query = v.user;

    d.resolve( v );

  } );

  return d.promise;

}

function _clean( v ) {

  if ( v.user ) {

    v.user = utils.filterByAttr( v.user, [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'facebook_uid', 'twitter_id', 'google_id',
      'culture', 'is_activated', 'created_at', 'updated_at', 'last_notified', 'is_removed', 'last_signin', 'comexposium_id',
      'api_key', 'api_secret' ] );

  }

  return v;

}

function _formatImageUrl( v ) {

  const image = v.user && v.user.image;

  if ( v.params.fullImagePath && image ) {

    if ( !image.match( /(?:https?:|\/\/)(.*)/ ) ) {
      v.user.image = '//' + config.files.bucket + '.s3.amazonaws.com/' + image;
    }

  }

  return v;

}


function getIdentifier( query, excludeEmail ) {

  var q = {};

  excludeEmail = typeof excludeEmail === 'undefined' ? false : excludeEmail;


  query = Object.assign( {
    id: null,
    uid: null,
    email: null
  }, query );

  [ 'id', 'uid' ].concat( excludeEmail ? [] : [ 'email' ] ).forEach( f => {
    if ( query[ f ] !== null ) q[ f ] = query[ f ];
  } );

  return q;

}

function emailAlreadyTaken( email ) {

  var d = w.defer();

  get( { email }, ( err, user ) => {

    if ( err ) return d.reject( err );

    if ( user ) return d.resolve( true );

    return d.resolve( false );

  } );

  return d.promise;

}