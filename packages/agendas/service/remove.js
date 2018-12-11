"use strict";

const logger = require( '@openagenda/logs' ),

w = require( 'when' ),

sUtils = require( './lib/utils')

let knex, interfaces, service, schemas;

module.exports = Object.assign( ( identifiers, cb ) => {

  w( Object.assign( {
    identifiers: sUtils.identifiers.clean( identifiers ),
    agenda: null
  }, {
    success: null
  } ) )

  .then( sUtils.identifiers.check )

  .then( _get )

  .then( _before )

  .then( _doRemove )

  .done( v => {

    if ( v.success && interfaces && interfaces.onRemove ) {

      interfaces.onRemove( v.agenda );

    }

    cb( null, {
      success: v.success
    } );

  }, cb );

}, { init } );


function _get( v ) {

  let d = w.defer();

  service.get( v.identifiers, { internal: true, private: null }, ( err, agenda ) => {

    if ( err ) return d.reject( err );

    v.agenda = agenda;

    d.resolve( v );

  } );

  return d.promise;

}


function _doRemove( v ) {

  if ( !v.agenda ) {

    return v;

  }

  return knex( schemas.agenda )

  .where( 'id', v.agenda.id )

  .del()

  .then( removedRows => {

    v.success = !!removedRows;

    return v;

  } );

}


function _before( v ) {

  if ( !interfaces || !interfaces.beforeRemove || !v.agenda ) {

    return v;

  }

  let d = w.defer();

  interfaces.beforeRemove( v.agenda, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function init( s, k ) {

  let config = s.getConfig();

  service = s;

  knex = k;

  schemas = config.schemas;

  interfaces = config.interfaces;

}
