"use strict";

const _ = require( 'lodash' );

const logger = require( '@openagenda/logs' );

const w = require( 'when' );

const wn = require( 'when/node' );

const cleanArgs = require( './lib/cleanArgs' );

const cleanOptions = require( './validate/removeOptions' );

const sUtils = require( '@openagenda/service-utils' );

let schemas, service, knex, config, log;

module.exports = Object.assign( remove, { init } );


function remove( i, o, c ) {

  const { identifiers, options, cb } = cleanArgs( i, o, c );

  const p = w( {
    identifiers,
    options: cleanOptions( options ),
    event: null,
    success: null
  } )

    .then( sUtils.identifiers.clean() )

    .then( _get )

    .then( _before )

    .then( _doRemove )

    .then( _transferToLegacy )

    .then( _callInterface )

  if ( cb === null ) return p;

  p.catch( cb );

  p.then( cb.bind( null, null ) );

}


async function _callInterface( v ) {

  if ( v.success && config.interfaces && config.interfaces.onRemove ) {

    try {
      await config.interfaces.onRemove( v.event, v.options.context );
    } catch ( e ) {
      log( 'error', 'Error in onRemove event interface:', e );
    }

  }  

  return v;

}


function _doRemove( v ) {

  if ( !v.event ) return v;

  return knex( schemas.event )

  .update( 'deleted_at', new Date() )

  .where( 'id', v.event.id )

  .then( affected => {

    v.success = !!affected;

    return v;

  } );

}


function _transferToLegacy( v ) {

  if ( !v.options.transferToLegacy ) return v;

  if ( !v.success ) return v;

  return service.legacy.remove( { uid: v.event.uid } )

    .then( ( { success } ) => {

      v.transferedToLegacy = !!success;

      return v;

    } );

}


function _before( v ) {

  if ( !config.interfaces || !config.interfaces.beforeRemove || !v.event ) {

    return v;    

  }

  return wn.call( config.interfaces.beforeRemove, v.event, v.options.context )

  .then( () => v );

}


function _get( v ) {

  return wn.call( service.get, v.identifiers, { internal: true, private: null } )

  .then( event => {

    v.event = event;

    return v;

  } );

}


function init( svc, c ) {

  service = svc;

  schemas = c.schemas;

  knex = c.knex;

  config = c;

  log = logger( 'event service.remove' );

}