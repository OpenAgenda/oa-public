"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const get = require( './get' );

const logger = require( '@openagenda/logs' )( 'remove' );

// service globals
let interfaces, schemas, knex;

module.exports = _.extend( remove, { init } );

function remove( preFilter, identifiers, cb ) {

  w( {
    preFilter,
    identifiers,
    stakeholder: null,
    result: {
      success: false
    }
  } )

  .then( _get )

  .then( _remove )

  .done( v => {

    if ( interfaces && interfaces.onRemove && v.result.success ) {

      interfaces.onRemove( v.stakeholder );

    }

    cb( null, v.result );

  }, cb );

}

function _get( v ) {

  let d = w.defer();

  get( v.preFilter, v.identifiers, ( err, stakeholder ) => {

    if ( err ) return d.reject( err );

    v.stakeholder = stakeholder;

    d.resolve( v );

  } );

  return d.promise;

}

function _remove( v ) {

  if ( !v.stakeholder ) return v;

  return knex( schemas.stakeholder )

    .where( 'id', v.stakeholder.id )

    .del()

  .then( deleted => {

    if ( deleted === 1 ) {

      v.result.success = true;

    } else {

      v.result.deletedCount = deleted;

    }

    return v;

  } );

} 

function init( config ) {

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}