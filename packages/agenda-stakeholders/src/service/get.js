"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const logger = require( '@openagenda/basic-logger' );
const format = require( './format' );
const validators = require( '../iso/validators' );

// service globals
let log, schemas, knex, interfaces;

module.exports = _.extend( get, { init } );

function get( preFilter, identifiers, options, cb ) {

  if ( arguments.length === 3 ) {

    cb = options;
    options = {}

  } 

  w( {
    identifiers: validators.clean( 'getQuery', _.extend( {}, identifiers, preFilter ) ),
    options: validators.clean( 'getOptions', options ),
    stakeholder: null,
  } )

  .then( _get )

  .then( _getEventCount )

  .then( _getUserInfo )

  .done( v => {
    
    cb( null, v.stakeholder );

  }, cb );

}


function init( config ) {

  log = logger( 'get' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}


function _get( v ) {

  let whereObj = format.objToDb( v.identifiers, true );

  let k = knex( schemas.stakeholder )

    .select( '*' )

    .where( whereObj );


  if ( v.identifiers.email ) {

    k.andWhere( 'store', 'like', '%"' + v.identifiers.email + '"%' );

  }

  return k.limit( 1 ).offset( 0 )

  .then( rows => {

    v.stakeholder = rows.length ? format.dbToObj( rows[ 0 ] ) : null;

    return v;

  } );

}


function _getEventCount( v ) {

  if ( !v.options.detailed || !interfaces || !v.identifiers.agendaId || !v.stakeholder ) {

    return v;

  }

  let d = w.defer();

  interfaces.getEventCount( v.identifiers.agendaId, v.stakeholder.userId, ( err, count ) => {

    if ( err ) return d.reject( err );

    v.stakeholder.eventCount = count;

    d.resolve( v );

  } );

  return d.promise;

}


function _getUserInfo( v ) {

  if ( !v.options.detailed || !interfaces ||!v.stakeholder ) {

    return v;

  }

  let d = w.defer();

  interfaces.getUser( { id: v.stakeholder.userId }, ( err, user ) => {

    if ( err ) return d.reject( err );

    v.stakeholder.user = user;

    d.resolve( v );

  } );

  return d.promise;

}