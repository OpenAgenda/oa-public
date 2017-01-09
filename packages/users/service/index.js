"use strict";

const knexLib = require( 'knex' ),

  w = require( 'when' ),

  wn = require( 'when/node' ),

  logger = require( 'basic-logger' ),

  mailer = require( 'mailer' ),

  validators = require( './validators' ),

  utils = require( 'utils' ),

  crypto = require( './crypto' ),

  mw = require( '../middleware' );


var config, knex, schemas;

const basicFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'created_at', 'updated_at' ];
const detailedFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image',
  'facebook_uid', 'twitter_id', 'google_id', 'culture', 'is_activated', 'created_at',
  'updated_at', 'last_notified', 'is_removed', 'last_signin', 'comexposium_id' ];


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
  generateApiKey,
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
    search: null,
    detailed: false,
    removed: false
  }, query );

  w( {
    offset,
    limit,
    query,
    users: [],
    total: null,
    knex: knex( schemas.user )
  } )

    .then( _search )

    .then( _filterRemoved )

    .then( _total )

    .then( _list )

    .done( v => cb( null, v.users, v.total ) );

}

function get( query, options, cb ) {

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  if ( typeof query === 'number' ) query = { id: query };

  const params = Object.assign( {
    fullImagePath: false,
    detailed: false,
    removed: false
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

function set( query, options, cb ) {

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  const params = Object.assign( {
    detailed: false,
    protected: true
  }, options );

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query, true ),
    query: Object.assign( {}, query ),
    params,
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
    query,
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
    query: Object.assign( {}, query ),
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
    params: { password: true },
    query,
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
    query: Object.assign( {}, query ),
    params: { store: true },
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
    identifier: getIdentifier( query ),
    query: Object.assign( {}, query ),
    params: { store: true },
    errors: [],
    emailChanged: false
  } )

    .then( _get )

    .then( _checkEmailTaken )

    .then( _confirmChangeEmail )

    .then( _updateOrInsert )

    .done( v => cb( null, v.emailChanged ), err => cb( err ) );

}

function generateApiKey( query, options, cb ) {

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  const params = Object.assign( {
    secret: false
  }, options );

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query ),
    query: Object.assign( {}, query ),
    params,
    errors: [],
    success: false
  } )

    .then( _get )

    .then( _generateApiKey )

    .then( _updateOrInsertApiKeySet )

    .done( v => cb( null, {
      success: v.success,
      errors: v.errors,
      key: v.params.secret ? v.query.api_secret : v.query.api_key
    } ), err => cb( err ) );

}

function remove( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: getIdentifier( query ),
    query,
    errors: [],
    success: false,
    action: 'remove',
    user: false,
    params: {
      store: true
    }
  } )

    .then( _get )

    .then( _removeUser )

    .done( v => cb( null, v.success ), err => cb( err ) );

}


function _search( v ) {

  if ( !v.query.search ) return v;

  v.knex.where( 'full_name', 'like', `%${v.query.search}%` )
    .orWhere( 'email', 'like', `%${v.query.search}%` );

  return v;

}

function _filterRemoved( v ) {

  if ( v.query.removed ) return v;

  v.knex = v.knex.where( 'is_removed', 0 );

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

  const detailed = v.query.detailed;

  return knex.transaction( trx => {

    return v.knex
      .column( detailed ? detailedFields : basicFields.concat( v.query.removed ? 'is_removed' : [] ) )
      .select()
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

  const identifiers = Object.keys( v.identifier );
  const detailed = v.params && v.params.detailed;
  const password = v.params && v.params.password;
  const store = v.params && v.params.store;
  const removed = v.params && v.params.removed || false;

  return knex.transaction( trx => {

    const fields = (detailed ? detailedFields : basicFields)
      .concat( password ? [ 'password', 'salt' ] : [] )
      .concat( store ? 'store' : [] )
      .concat( !detailed && !removed ? 'is_removed' : [] )
      .map( v => `${schemas.user}.${v}` )
      .concat( detailed ? [ schemas.apiKeySet + '.api_key', schemas.apiKeySet + '.api_secret' ] : [] );

    let request = knex.column( fields ).select().from( schemas.user );

    if ( detailed ) {
      request = request.leftJoin( schemas.apiKeySet, schemas.user + '.id', schemas.apiKeySet + '.user_id' );
    }

    if ( !removed ) {
      request = request.where( schemas.user + '.is_removed', 0 );
    }

    return request
      .where( schemas.user + '.' + ( identifiers[ 0 ] || 'id' ), v.identifier[ identifiers[ 0 ] ] || -1 )
      .limit( 1 )
      .transacting( trx );

  } )

    .then( users => {

      v.user = users.length ? users[ 0 ] : null;

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

  const detailed = v.params && v.params.detailed;

  get( v.query, { detailed: detailed }, ( err, user ) => {

    if ( err ) return d.reject( err );

    var mode = user && ( v.query.id || v.query.uid ) ? 'update' : 'insert',

      identifiers = Object.keys( v.identifier ),

      validator = mode == 'update' ?
        validators.update( v.query, v.params && v.params.protected, v.action == 'remove' ) :
        validators( v.query, v.params && v.params.protected ),

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

function _updateOrInsertApiKeySet( v ) {

  if ( v.errors.length ) return v;

  return knex.transaction( trx => {

    return knex
      .select( '*' )
      .from( schemas.apiKeySet )
      .where( 'user_id', v.query.id || -1 )
      .limit( 1 )
      .transacting( trx );

  } )

    .then( keySets => {

      const keySet = keySets.length ? keySets[ 0 ] : null;

      return Object.assign( v, { keySet } );

    }, err => {

      throw err;

    } )

    .then( v => {

      const d = w.defer();

      const mode = v.keySet ? 'update' : 'insert',

        identifiers = Object.keys( v.identifier ),

        validator = validators.apiKeySet( v.query ),

        fields = validator.fields;


      v.valid = validator.valid;

      if ( !v.valid ) {

        v.errors = validator.errors;
        return d.resolve( v );

      }

      if ( mode == 'insert' ) {
        fields.user_id = v.user.id;
        fields.type = 1;
        fields.created_at = new Date();
      }
      fields.updated_at = new Date();

      knex.transaction( trx => {

        const queryBuilder = knex( schemas.apiKeySet )[ mode ]( fields );

        if ( mode == 'update' ) {

          queryBuilder.where( 'user_id', v.identifier[ identifiers[ 0 ] ] || -1 )

        }

        return queryBuilder.transacting( trx );

      } ).then( result => {
        v.success = true;

        return d.resolve( v );
      }, err => {

        return d.reject( err );

      } );

      return d.promise;

    } );

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


  var store = JSON.parse( v.user.store || '{}' ),

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

  return wn.call( config.interfaces.userWillRemove, v.user )

  .then( () => {

    let date = new Date();

    let store = JSON.parse( !v.user.store ? '{}' : v.user.store );

    store.email = v.user.email;

    return knex( schemas.user )

    .update( {
      is_removed: 1,
      is_activated: 0,
      updated_at: date,
      username: `*removed-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${v.user.id}`,
      email: null,
      store: JSON.stringify( store )
    } )

    .where( { id: v.user.id } );

  } )

  .then( affected => {

    v.success = affected === 1;

    return v;

  } );

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

function _generateApiKey( v ) {

  if ( !v.user ) {
    v.errors.push( {
      code: 'user.notfound',
      message: 'user not found',
    } );
    v.success = false;

    return v;
  }

  v.query[ v.params.secret ? 'api_secret' : 'api_key' ] = crypto.randomHash();

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