"use strict";

const  _ = require( 'lodash' );

const utils = require( '@openagenda/utils' );

const { promisify } = require( 'util' );

const details = require( './details' );

const map = require( './databaseFieldMap' );

const dbParse = require( '@openagenda/mysql-utils/mapper' )( map );

const validate = require( './validate' );

const validateOptions = require( './validate/getOptions' );

const sUtils = require( './lib/utils' );

const loadDetails = promisify( details.load );

let knex, service, schemas, imagePath;

module.exports = get;
module.exports.init = init;
module.exports.findOne = findOne;

function findOne( search, options, cb ) {

  if ( arguments.length === 2 ) {

    cb = options;
    options = {};

  }

  knex( schemas.agenda )

    .select( 'id' )

    .where( 'title', 'like', '%' + search + '%' )

    .limit( 1 )

  .then( rows => {

    if ( !rows.length ) return cb( null, null );

    get( rows[ 0 ].id, options, cb );

  }, cb );

}

function get( i, o, c ) {

  const { identifiers, options, cb } = _parseGetArguments( i, o, c );

  const p = promise( identifiers, options );

  if ( cb ) return p.then(  agenda => cb( null, agenda ), cb );

  return p;

}

async function promise( identifiers, options = {} ) {

  const filtered = {};

  if ( !_.keys( identifiers ).length ) {

    throw new Error( 'No known identifiers specified for get: ' + JSON.stringify( identifiers ) );

  }

  const k = knex( schemas.agenda )
    .first( dbParse.fields( 'db', options.internal, [ 'id' ] ) )
    .where( identifiers );

  if ( options.private !== null ) k.andWhere( 'private', options.private );

  const rawAgenda = await k.then( result => result ? _applyDefaults( dbParse.toObj( result ) ) : null );

  if ( !rawAgenda ) return null;

  if ( options.detailed ) {

    await _.assign( rawAgenda, await loadDetails( rawAgenda, options ) );

  }

  const agenda = _.keys( rawAgenda ).reduce( ( filtered, field ) => {

    if ( options.internal || !dbParse.is( 'obj', field, 'internal' ) ) {

      filtered[ field ] = rawAgenda[ field ];

    }

    return filtered;

  }, {} );

  if ( options.includeImagePath && agenda.image ) {

    agenda.image = imagePath + agenda.image;

  } else if ( options.useDefaultImage && !agenda.image ) {

    agenda.image = service.getConfig().defaultImagePath;

  }

  return options.instanciate ? new service.Agenda( agenda ) : agenda;

}




/**
 * get db entry based on identifiers
 */
function _get( v ) {

  let k = knex( schemas.agenda )

  .select( dbParse.fields( 'db', v.internal, [ 'id' ] ) )

  .where( v.identifiers );

  if ( v.private !== null ) {

    k.andWhere( 'private', v.private );

  }

  return k.then( rows => {

    if ( !rows.length ) return v;

    v.entry = rows[ 0 ];

    return v;

  } );

}


function _transform( v ) {

  if ( !v.entry ) return v;

  v.data = dbParse.toObj( v.entry );

  v.data = _applyDefaults( v.data );

  return v;

}


/**
 * in db, values are null when they are not defined.
 * In those cases, default value should apply.
 */

function _applyDefaults( data ) {

  let defaulted = utils.extend( {}, validate.default );

  Object.keys( data ).forEach( k => {

    defaulted[ k ] = _.includes( [ 'null', '{}' ], JSON.stringify( data[ k ] ) ) ? defaulted[ k ] : data[ k ];

  } );

  return defaulted;

}


function _detailed( agenda, includeRestricted ) {



}


function _detailed( v ) {

  if ( !v.detailed || !v.data ) return v;

  let d = w.defer();

  details.load( v.data, { includeRestricted: v.includeRestricted }, ( err, data ) => {

    if ( err ) return d.reject( err );

    v.data = data;

    d.resolve( v );

  } );

  return d.promise;

}


function _filterInternals( v ) {

  if ( !v.data ) return v;

  v.filtered = {};

  Object.keys( v.data )
    .filter( f => {

      return v.internal || !dbParse.is( 'obj', f, 'internal' );

    } )
    .forEach( f => {

      v.filtered[ f ] = v.data[ f ];

    } );

  return v;

}


function init( svc, k ) {

  service = svc;

  schemas = service.getConfig().schemas;

  imagePath = service.getConfig().imagePath;

  knex = k;

}


function _parseGetArguments( identifiers, options, cb ) {

  if ( typeof cb === 'function' ) return { 
    identifiers: sUtils.identifiers.clean( identifiers ),
    options: validateOptions( options ),
    cb 
  }

  if ( typeof options === 'function' ) {

    return {
      identifiers: sUtils.identifiers.clean( identifiers ),
      options: validateOptions(),
      cb: options
    }

  }

  return {
    identifiers: sUtils.identifiers.clean( identifiers ),
    options: validateOptions( options ),
    cb: null
  }

}
